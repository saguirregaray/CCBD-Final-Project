import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {CognitoUserAttribute } from 'amazon-cognito-identity-js';
// AWS Cloudscape
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Input from "@cloudscape-design/components/input";
import Container from "@cloudscape-design/components/container";
import Button from "@cloudscape-design/components/button";

import userpool from '../userpool';

const Signup = () => {

  const Navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleClick = (e) => {
    const attributeList = [];
    attributeList.push(
      new CognitoUserAttribute({
        Name: 'email',
        Value: email,
      })
    );
    let username=email;
    userpool.signUp(username, password, attributeList, null, (err, data) => {
      if (err) {
        console.log(err);
        alert("Couldn't sign up");
      } else {
        console.log(data);
        alert('User Added Successfully');
        Navigate('/dashboard');
      }
    });
  }

  return (
    <ContentLayout
      header={
        <SpaceBetween size="m">
          <Header
            variant="h1"
            description="Language differences create significant challenges for online educational videos and podcasts. These barriers can limit the global reach of valuable content and hinder understanding for viewers and listeners. We aim to tackle this issue by creating a cloud-based system that provides real-time voice translation for educational content. What makes our proposed solution unique is that it maintains the original speaker's voice, ensuring a seamless, natural, and immersive learning experience."
          >
            Real-Time Voice Translation and Input Voice simulator
          </Header>
        </SpaceBetween>
      }
    >
      <Container>

        <h5>Please Enter Your Email and Password to Sign Up</h5>
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
          <SpaceBetween alignItems="end"><Button iconAlign="right" variant="primary" onClick={handleClick}>Sign Up</Button></SpaceBetween>
        </SpaceBetween>

      </Container>
    </ContentLayout>
  )
}

export default Signup
