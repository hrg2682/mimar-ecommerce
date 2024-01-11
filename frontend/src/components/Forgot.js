import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import axios from 'axios';
import { Formik,Form,Field,ErrorMessage } from 'formik';
import * as Yup from 'yup';

export default function Forgot() {
  //Formik related
  const initialValues = {
    email:''
  }; 
  const validationSchema = Yup.object({
    email: Yup.string().required('Required')
    .email('Invalid email format')
  });
  const onSubmit = (values, onSubmitProps) => {
    const email = values.email;
    axios.post('http://localhost:4000/api/user/forgotpass', {email})
      .then(() => {
        console.log('success');
        toast.success('Please Check your Email!', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true, 
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark"
        });
      })
      .catch((error) => {
        console.log(error);
        toast.error('Email is not registered!', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark"
        });
      });
    onSubmitProps.resetForm();
  };

  return (
    <div className="columns mt-6">
      <ToastContainer />
      <div className="column"></div>
      <div className="column box p-6 is-5 has-background-light">
        <h1 className="title has-text-centered has-text-success">
          Enter your registered email
        </h1>
        <Formik 
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          <Form>
            <div className="field">
              <label className="label"></label>
              <div className="control has-icons-left has-icons-right">
                <Field className="input" id='email' type='email' name='email' placeholder='Enter your email address'/>
                <ErrorMessage name='email' 
                  render={msg => <div className='has-text-danger ml-2'>{msg}</div>}
                />
                <span className="icon is-small is-left">
                  <i className="fa fa-envelope"></i>
                </span>
              </div>
            </div>
            <div className="field columns mt-5 mb-5">
              <div className="column"></div>
              <button
                type='submit'
                style={{ borderRadius: '1.2rem' }}
                className="column ml-6 is-5 has-background-primary has-text-white"
                id="confirm"
              >
                CONFIRM
              </button>
              <div className="column"></div>
            </div>
            <a href='/login'>Back to login</a>
          </Form>
        </Formik>
      </div>
      <div className="column"></div>
    </div>
  )
}
