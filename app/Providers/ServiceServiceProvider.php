<?php

namespace App\Providers;

use App\Contracts\ActivityLogInterface;
use App\Contracts\SambaInterface;
use App\Contracts\VisitorInterface;
use App\Contracts\VoucherInterface;
use App\Services\ActivityLogService;
use App\Services\SambaService;
use App\Services\VisitorService;
use App\Services\VoucherService;
use Illuminate\Support\ServiceProvider;

class ServiceServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(SambaInterface::class, SambaService::class);
        $this->app->singleton(ActivityLogInterface::class, ActivityLogService::class);
        $this->app->singleton(VoucherInterface::class, VoucherService::class);
        $this->app->singleton(VisitorInterface::class, VisitorService::class);
    }

    public function boot(): void
    {
        //
    }
}