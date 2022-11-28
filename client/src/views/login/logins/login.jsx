import { Password } from 'primereact/password';
import { Card } from 'primereact/card';
import { useContext, useState } from 'react';
import React from 'react';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import validator from 'validator';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoginStatusContext from '../../../contexts/login-status-context';
import ToasterContext from '../../../contexts/toaster-context';

const Login = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [formError, setFormError] = useState({
    email: true,
    password: true,
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const navigate = useNavigate();
  const [loginStatus, setLoginStatus] = useContext(LoginStatusContext);

  const toast = useContext(ToasterContext);

  const header = <h6>Entrez un mot de passe</h6>;
  const footer = (
    <React.Fragment>
      <Divider />
      <p className="p-mt-2">Suggestions</p>
      <ul className="p-pl-2 p-ml-2 p-mt-0" style={{ lineHeight: '1.5' }}>
        <li>Au moins une lettre minuscule</li>
        <li>Au moins une lettre majuscule</li>
        <li>Au moins un chiffre</li>
        <li>Minimum 8 caracteres</li>
      </ul>
    </React.Fragment>
  );

  const handleForm = (value, type) => {
    setForm({ ...form, [type]: value });
    setFormError({ ...formError, [type]: true });
  };

  const validation = () => {
    const validation = {
      email: validator.isEmail(form.email),
      password: validator.isLength(form.password, { min: 8 }),
    };
    setFormError(validation);
    let validationValue = false;
    for (const key in validation) {
      const value = validation[key];
      if (value === false) {
        validationValue = false;
        break;
      } else {
        validationValue = true;
      }
    }
    return validationValue;
  };

  const submitLogin = async () => {
    const valid = validation();
    if (valid) {
      setSubmitLoading(true);
      try {
        await axios.post('/auth/login', form);
        toast.current.show({
          severity: 'success',
          summary: 'Bienvenue',
          detail: 'Profite BOGOSS',
        });
        console.log('====================================');
        console.log(loginStatus);
        console.log('====================================');
        setLoginStatus({ ...loginStatus, app: true });
        navigate('/auth/spotify/login');
      } catch (err) {
        toast.current.show({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Un probléme a eu lieu pendant la creation de votre compte',
        });
      }
      setSubmitLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <Card>
        <div className="font-semibold">Login</div>
        <div className="p-inputgroup mt-4">
          <span className="p-inputgroup-addon">
            <i className="pi pi-send"></i>
          </span>
          <InputText
            placeholder="Email"
            aria-describedby="email-help"
            className={!formError.email ? 'p-invalid p-d-block' : ''}
            onChange={(e) => handleForm(e.target.value, 'email')}
          />
        </div>
        {!formError.email && (
          <small id="email-help" className="p-error p-d-block">
            E mail incorrect.
          </small>
        )}
        <div className="p-inputgroup mt-4">
          <span className="p-inputgroup-addon">
            <i className="pi pi-lock"></i>
          </span>
          <Password
            value={form.password}
            onChange={(e) => handleForm(e.target.value, 'password')}
            header={header}
            footer={footer}
            placeholder="Mot de passe"
            toggleMask
            aria-describedby="password-help"
            className={!formError.password ? 'p-invalid p-d-block' : ''}
          />
        </div>
        {!formError.password && (
          <small id="password-help" className="p-error p-d-block">
            Mot de passe incorrect.
          </small>
        )}
        <div className="mt-4">
          <Button
            label="Soumettre"
            icon="pi pi-sign-in"
            loading={submitLoading}
            onClick={submitLogin}
          />
        </div>
      </Card>
    </div>
  );
};

export default Login;
