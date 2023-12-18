import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { authenticate } from '../services/authenticate';
import userpool from '../userpool'

// AWS Cloudscape
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Input from "@cloudscape-design/components/input";
import Container from "@cloudscape-design/components/container";
import Button from "@cloudscape-design/components/button";
import Alert from "@cloudscape-design/components/alert";

const Login = () => {

  const Navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginErr,setLoginErr]=useState('');

  const handleClick = () => {
    authenticate(email,password)
      .then((data)=>{
        setLoginErr('');
        Navigate('/dashboard');
      },(err)=>{
        console.log(err);
        setLoginErr(err.message)
      })
      .catch(err=>console.log(err))
  }

  return (
    <ContentLayout
      header={
        <SpaceBetween size="m">
          <Header
            variant="h1"
            description="Language differences create significant challenges for online educational videos and podcasts. These barriers can limit the global reach of valuable content and hinder understanding for viewers and listeners. We aim to tackle this issue by creating a cloud-based system that provides real-time voice translation for educational content. Our system ensures a seamless, natural, and immersive learning experience."
          >
            Real-Time Voice Translation and Input Voice simulator
          </Header>
        </SpaceBetween>
      }
    >
      <Container>
        {loginErr !== '' &&
        <Alert
          statusIconAriaLabel="Info"
          header="Login Error"
        >
          {loginErr}
        </Alert>}

        <h5>Please Enter Your Email and Password to Log In</h5>
        <SpaceBetween size="m">
          <Input
            onChange={({ detail }) => setEmail(detail.value)}
            value={email}
            placeholder="Enter your email"
          />
          <Input
            onChange={({ detail }) => setPassword(detail.value)}
            value={password}
            placeholder="Enter your password"
            type="password"
          />
          <SpaceBetween alignItems="end"><Button iconAlign="right" variant="primary" onClick={handleClick}>Log In</Button></SpaceBetween>
        </SpaceBetween>

      </Container>
    </ContentLayout>
  )
}

export default Login