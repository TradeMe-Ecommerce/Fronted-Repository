import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { register, clearError } from '../../store/slices/authSlice';
import { Package, AlertCircle, CheckCircle2 } from 'lucide-react';
import Spinner from '../../components/common/Spinner';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate  = useNavigate();
  const { isLoading, error } = useSelector((s: RootState) => s.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError]       = useState('');
  const [success, setSuccess]             = useState(false);  

  /* ---------- handlers ---------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) dispatch(clearError());

    const { name, value } = e.target;
    if (passwordError && name === 'confirmPassword') setPasswordError('');
    if (emailError    && name === 'email')           setEmailError('');

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    /* --- validaciones front --- */
    if (!emailRegex.test(formData.email)) {
      setEmailError('Correo electrónico inválido');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }


    const { name, email, password } = formData;
    const result = await dispatch(register({ name, email, password }));

    if (register.fulfilled.match(result)) {
      setSuccess(true);               // muestra mensaje "registro exitoso"
      setTimeout(() => navigate('/login'), 1500);   // redirige al login después de 1.5 s
    }
  };

  /* ---------- render ---------- */
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 relative">
        {/* overlay de carga global (opcional) */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-md">
            <Spinner size="lg" />        {/* círculo de carga grande */}
          </div>
        )}

        {/* banner de éxito */}
        {success && (
          <div className="rounded-md bg-emerald-50 p-4 flex items-center gap-2 mb-4">
            <CheckCircle2 className="text-emerald-500" />
            <span className="text-sm text-emerald-800">¡Registro exitoso! Redirigiendo…</span>
          </div>
        )}

        {/* cabecera */}
        <div className="text-center">
          <div className="flex justify-center">
            <Package className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Crea tu cuenta</h2>
          <p className="mt-2 text-sm text-gray-600">
            O{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              inicia sesión en tu cuenta
            </Link>
          </p>
        </div>

        {/* formulario */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* errores de backend */}
          {error && (
            <Alert message={error} />
          )}

          {/* error email */}
          {emailError && (
            <Alert message={emailError} />
          )}

          {/* error password */}
          {passwordError && (
            <Alert message={passwordError} />
          )}

          {/* inputs */}
          <Input id="name"  label="Nombre" type="text"  value={formData.name}  onChange={handleChange}/>
          <Input id="email" label="Correo electrónico" type="email" value={formData.email} onChange={handleChange}/>
          <Input id="password" label="Contraseña" type="password" value={formData.password} onChange={handleChange}/>
          <Input id="confirmPassword" label="Confirmar contraseña" type="password" value={formData.confirmPassword} onChange={handleChange}/>

          {/* botón */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70"
          >
            {isLoading ? <Spinner size="sm" color="text-white" /> : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ---------- componentes utilitarios ---------- */
const Input = ({ id, label, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { id:string; label:string; }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="mt-1">
      <input
        id={id}
        name={id}
        required
        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        {...rest}
      />
    </div>
  </div>
);

const Alert = ({ message }: { message: string }) => (
  <div className="rounded-md bg-error-50 p-3 flex items-center gap-2">
    <AlertCircle className="h-5 w-5 text-error-400" />
    <span className="text-sm text-error-800">{message}</span>
  </div>
);

export default Register;
