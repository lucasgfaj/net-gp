<?php

namespace App\Services;

use App\Contracts\SambaInterface;
use Illuminate\Support\Facades\Log;
use phpseclib3\Net\SSH2;
use phpseclib3\Crypt\PublicKeyLoader;

class SambaService implements SambaInterface
{
    protected string $host;
    protected string $user;
    protected string $keyPath;
    protected int $port;
    protected bool $debug = true;
    protected int $timeout = 10;
    protected int $connectionTimeout = 5;

    public function __construct()
    {
        $this->host = config('app.ip_smb');
        $this->user = config('app.user_smb');
        $this->keyPath = config('app.path_ssh_smb'); 
        $this->port = (int) config('app.port_smb');
    }

    protected function connect(): SSH2
    {
        $ssh = new SSH2($this->host, $this->port, $this->connectionTimeout);
        $ssh->setTimeout($this->timeout);

        $key = PublicKeyLoader::loadPrivateKey(
            file_get_contents($this->keyPath)
        );

        if (!$ssh->login($this->user, $key)) {
            throw new \Exception('Falha autenticação SSH phpseclib');
        }

        return $ssh;
    }

    protected function execute(string $cmd): array
    {
        try {
            $ssh = $this->connect();

            $output = $ssh->exec($cmd);
            $exitCode = $ssh->getExitStatus();

            if ($this->debug) {
                Log::info('DEBUG SAMBA PHPSECLIB', [
                    'command' => $cmd,
                    'exit_code' => $exitCode,
                    'output' => $output,
                ]);
            }

            if ($exitCode !== 0) {
                return [
                    'success' => false,
                    'exit_code' => $exitCode,
                    'error' => $output,
                ];
            }

            return [
                'success' => true,
                'output' => $output,
            ];
        } catch (\Throwable $e) {
            Log::error('Erro SSH phpseclib', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function createSambaUser(string $username, string $password): array
    {
        if ($this->userExists($username)) {
            return [
                'success' => false,
                'exit_code' => 255,
                'error' => 'User already exists in SAMBA',
            ];
        }

        return $this->execute(sprintf(
            'sudo /usr/bin/samba-tool user create %s %s',
            escapeshellarg($username),
            escapeshellarg($password)
        ));
    }

    public function userExists(string $username): bool
    {
        $result = $this->execute(sprintf(
            'sudo /usr/bin/samba-tool user list | grep -w %s',
            escapeshellarg($username)
        ));

        return $result['success'] && !empty(trim($result['output']));
    }

    public function updateSambaUserPassword(string $username, string $newPassword): array
    {
        return $this->execute(sprintf(
            'sudo /usr/bin/samba-tool user setpassword %s --newpassword=%s',
            escapeshellarg($username),
            escapeshellarg($newPassword)
        ));
    }

    public function updateSambaUserExpiry(string $username, string $expiresAt): array
    {
        $date = \Carbon\Carbon::parse($expiresAt)->format('Y-m-d');

        return $this->execute(sprintf(
            'sudo /usr/bin/samba-tool user setexpiry %s --days=0 --date=%s',
            escapeshellarg($username),
            escapeshellarg($date)
        ));
    }

    public function deleteSambaUser(string $username): array
    {
        return $this->execute(sprintf(
            'sudo /usr/bin/samba-tool user delete %s',
            escapeshellarg($username)
        ));
    }
}