<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VoucherIndexRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'type_id' => ['nullable', 'integer', 'exists:visitor_types,id'],
            'creator_id' => ['nullable', 'integer', 'exists:users,id'],
            'order_department' => ['nullable', 'integer', 'exists:departments,id'],
            'expire_sort' => ['nullable', 'in:closest,furthest'],
            'created_sort' => ['nullable', 'in:newest,oldest'],
            'sort' => ['nullable', 'string', 'in:id,created_at,expires_at,login'],
            'direction' => ['nullable', 'string', 'in:asc,desc'],
        ];
    }
}
