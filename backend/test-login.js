fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cpf: '11122233344', senha: '123456' })
}).then(res => res.json()).then(data => console.log('Dono:', data));

fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cpf: '12345678901', senha: '123456' })
}).then(res => res.json()).then(data => console.log('Paciente:', data));
