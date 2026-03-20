<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use phpseclib3\Net\SSH2;
use phpseclib3\Crypt\PublicKeyLoader;

class SambaService
{
    protected string $host;
    protected string $user;
    protected string $keyPath; 
    protected int $port;

    public function __construct(){
        $this->host = config('app.ip_smb');
        $this->user = config('app.user_smb');
        $this->keyPath = config('app.path_ssh_smb');
        $this->port = (int) config('app.port_smb');
    }

    protected bool $debug = true;

    protected function connect(): SSH2
    {
        $ssh = new SSH2($this->host, $this->port);

        try {
            $key = PublicKeyLoader::loadPrivateKey(file_get_contents($this->keyPath));
        } catch (\Throwable $e) {
            Log::error('Falha ao carregar chave privada SSH', ['exception' => $e->getMessage()]);
            throw new \Exception('Falha ao carregar chave SSH');
        }

        if (!$ssh->login($this->user, $key)) {
            Log::error('Falha na autenticação SSH com phpseclib');
            throw new \Exception('Falha na autenticação SSH');
        }

        return $ssh;
    }

    protected function execute(string $cmd): array
    {
        try {
            $ssh = $this->connect();

            $output = $ssh->exec("bash -lc " . escapeshellarg($cmd));
            $exitCode = $ssh->getExitStatus();


            if ($this->debug === true) {
                Log::info('DEBUG SAMBA', [
                    'command' => $cmd,
                    'exit_code' => $exitCode,
                    'output' => $output,
                ]);
            }

            if ($exitCode !== 0) {
                return [
                    'success' => false,
                    'exit_code' => $exitCode,
                    'error' => $output ?: 'Erro desconhecido',
                ];
            }

            return [
                'success' => true,
                'output' => $output,
            ];
        } catch (\Throwable $e) {
            Log::error('Erro ao executar comando Samba', ['exception' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function createSambaUser(string $username, string $password): array
    {
        $cmd = sprintf(
            'sudo /usr/bin/samba-tool user create %s %s',
            escapeshellarg($username),
            escapeshellarg($password)
        );

        return $this->execute($cmd);
    }

    public function updateSambaUserPassword(string $username, string $newPassword): array
    {
        $cmd = sprintf(
            'sudo /usr/bin/samba-tool user setpassword %s --newpassword=%s',
            escapeshellarg($username),
            escapeshellarg($newPassword)
        );

        return $this->execute($cmd);
    }

    public function deleteSambaUser(string $username): array
    {
        $cmd = sprintf(
            'sudo /usr/bin/samba-tool user delete %s',
            escapeshellarg($username)
        );

        return $this->execute($cmd);
    }
}