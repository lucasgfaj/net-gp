export function maskPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 10) {
        return digits.replace(
            /^(\d{0,2})(\d{0,4})(\d{0,4})$/,
            (_, ddd, first, last) =>
                `${ddd ? `(${ddd}` : ''}${ddd.length === 2 ? ') ' : ''}${
                    first || ''
                }${last ? '-' + last : ''}`
        );
    }

    return digits.replace(
        /^(\d{0,2})(\d{0,5})(\d{0,4})$/,
        (_, ddd, first, last) =>
            `${ddd ? `(${ddd}` : ''}${ddd.length === 2 ? ') ' : ''}${
                first || ''
            }${last ? '-' + last : ''}`
    );
}

export function maskCPF(value: string){
    const digits = value.replace(/\D/g, '').slice(0, 11);
    
    return digits
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

export function formatDateBR(date: string) {
  if (!date) return '';

  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}
