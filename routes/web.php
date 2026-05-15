<?php

use App\Http\Controllers\ActivitiesController;
use App\Http\Controllers\DepartmentsController;
use App\Http\Controllers\VisitorsController;
use App\Http\Controllers\VisitorImportController;
use App\Http\Controllers\VisitorTypeController;
use App\Http\Controllers\VouchersController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ImportBatchController;
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
    Route::get('dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::resource('users', UsersController::class);
    Route::get('activities', [ActivitiesController::class, 'index'])
        ->name('activities.index');
    Route::get('activities/{activity}', [ActivitiesController::class, 'show'])
        ->name('activities.show');
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::resource('departments', DepartmentsController::class);
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::resource('visitorTypes', VisitorTypeController::class);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('visitors/import', [VisitorImportController::class, 'index'])
        ->name('visitors.import.index');

    Route::post('visitors/import', [VisitorImportController::class, 'store'])
        ->name('visitors.import.store');

    Route::get('visitors/create', [VisitorsController::class, 'create'])
        ->name('visitors.create');

    Route::get('visitors/{visitor}', [VisitorsController::class, 'show'])
        ->name('visitors.show')
        ->where('visitor', '[0-9]+');

    Route::resource('visitors', VisitorsController::class)
        ->only(['index', 'store', 'edit', 'update', 'destroy']);

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

    Route::get('import-batches', [ImportBatchController::class, 'index'])
        ->name('import-batches.index');

    Route::get('import-batches/{batch}', [ImportBatchController::class, 'show'])
        ->name('import-batches.show');

    Route::delete('import-batches/{batch}', [ImportBatchController::class, 'destroy'])
        ->name('import-batches.destroy');
});

require __DIR__.'/settings.php';

