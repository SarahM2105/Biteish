import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';


function Auth(){
    const [isRegistering, setIsRegistering] = useState(false);
    const [form, setForm] = useState({name: '', email: '', password: '', role: 'CUSTOMER'});
    const [status, setStatus] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({...form, [e.target.id]: e.target.value});
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const url = isRegistering ? '/api/auth/register' : '/api/auth/login';
        const payload = isRegistering ? {name: form.name, email: form.email, password: form.password, role: form.role}
            : {email: form.email, password: form.password};

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const text = await res.text()
            const data = text ? JSON.parse(text) : {};

            if (res.ok) {
                setStatus(isRegistering ? 'registered successfully. log in' : 'login successful');
                if (data.token){
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('name', data.user?.name || 'user');
                    localStorage.setItem('role', data.user?.role || 'CUSTOMER');
                    localStorage.setItem('userId', data.user?.id || data.user?.userId || '');
                    navigate(`/${data.user?.role?.toLowerCase() || 'customer'}-dashboard`);
                }
            }else {
                setStatus(data.error || 'something went wrong');
            }
        } catch (error) {
            console.error(error);
            setStatus('error connecting to server')
        }
    };
    return (
        <div>
            <h2> welcome </h2>
            <button onClick={() => setIsRegistering(!isRegistering)}>
                {isRegistering ? 'switch to login' : 'switch to registering'}
            </button>
            <form onSubmit={handleSubmit}>
                {isRegistering &&(
                    <input
                        type="text"
                        id="name"
                        placeholder="Name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        />
                )}
                <input
                type="email"
                id="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                />
                <input
                type="password"
                id="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                />
                {isRegistering && (
                    <select id="role" value={form.role} onChange={handleChange}>
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="OWNER">OWNER</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                )}
                <button type="submit">{isRegistering? 'Register' : 'Login'}</button>
            </form>
            <p> {status}</p>
        </div>
    )
}
export default Auth;