<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Inertia\Inertia;

class ActivitiesController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if (!$user->isAdmin()) {
            abort(403, 'Acesso restrito a administradores.');
        }

        $activities = ActivityLog::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $activitiesArray = $activities->toArray();
        
        if (!empty($activitiesArray['links'])) {
            $activitiesArray['links'] = collect($activitiesArray['links'])
                ->map(fn($link) => [
                    'url' => $link['url'],
                    'label' => strip_tags(html_entity_decode($link['label'])),
                    'active' => $link['active'] ?? false,
                ])
                ->all();
        }

        return Inertia::render('activities/index', [
            'activities' => $activitiesArray,
        ]);
    }

    public function show(ActivityLog $activity)
    {
        $user = auth()->user();

        if (!$user->isAdmin()) {
            abort(403, 'Acesso restrito a administradores.');
        }

        $activity->load('user.department');

        return Inertia::render('activities/show', [
            'activity' => $activity,
        ]);
    }
}