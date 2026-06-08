<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserIndexRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
       return [
            'search' => ['nullable', 'string', 'max:255'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'order_name' => ['nullable', 'in:asc,desc'],
            'order_created' => ['nullable', 'in:newest,oldest'],
            'order_department' => ['nullable', 'integer'],
            'sort' => ['nullable', 'in:id,name,created_at'],
            'direction' => ['nullable', 'in:asc,desc'],
        ];

    }
}
