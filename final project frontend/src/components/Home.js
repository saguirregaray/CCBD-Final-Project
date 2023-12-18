import React from 'react'
import { useNavigate } from 'react-router-dom'

// AWS Cloudscape
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Container from "@cloudscape-design/components/container";
import Button from "@cloudscape-design/components/button";

const Home = () => {
    const Navigate=useNavigate();
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
                <SpaceBetween alignItems="center"><h1>Welcome</h1></SpaceBetween>
                <SpaceBetween size="m" alignItems="center">
                    <Button variant="primary" onClick={()=>Navigate('/signup')}>Sign Up</Button>
                    <Button variant="primary" onClick={()=>Navigate('/login')}>Login</Button>
                </SpaceBetween>

            </Container>
        </ContentLayout>
    )
}

export default Home
