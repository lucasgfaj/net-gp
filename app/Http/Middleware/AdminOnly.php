<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Contracts\Auth\StatefulGuard;

class AdminOnly
{
    /**
     * @var StatefulGuard
     */
    protected $auth;

    public function __construct(StatefulGuard $auth)
    {
        $this->auth = $auth;
    }

    public function handle(Request $request, Closure $next)
    {
        if (!$this->auth->check() || $this->auth->user()->role !== 'admin') {
            abort(403, 'Acesso não permitido.');
        }

        return $next($request);
    }
}
