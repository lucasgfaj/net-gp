<?php

use App\Http\Controllers\DepartmentsController;
use App\Http\Controllers\VisitorsController;
use App\Http\Controllers\VouchersController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\UsersController;

Route::get('/', function () {
    return Inertia::render('auth/login', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::resource('users', UsersController::class);
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::resource('departments', DepartmentsController::class);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('visitors', VisitorsController::class);

    Route::post(
        'visitors/{visitor}/generate-password',
        [VisitorsController::class, 'generatePassword']
    )->name('visitors.generate-password');
    
    Route::post(
    '/visitors/{visitor}/resend-password',
    [VisitorsController::class, 'resendPassword']
)->name('visitors.resend-password');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('vouchers', VouchersController::class);
});

require __DIR__.'/settings.php';

