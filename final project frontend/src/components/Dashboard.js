import React,{useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import userpool from '../userpool'
import { logout } from '../services/authenticate';

// AWS Cloudscape
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import Tabs from "@cloudscape-design/components/tabs";
// Components
import UploadTab from "./upload";
import AllFiles from "./files";
import Recommendations from "./recommendations";

const Dashboard = () => {

  const Navigate = useNavigate();

  useEffect(()=>{
    let user = userpool.getCurrentUser();
    console.log(user);
    if(!user){
      Navigate('/login');
    }
  },[]);

  const handleLogoout=()=>{
    logout();
  };

  return (
    <ContentLayout
        disableOverlap
        header={
          <SpaceBetween size="m">
            <Header
              variant="h1"
              description="Language differences create significant challenges for online educational videos and podcasts. These barriers can limit the global reach of valuable content and hinder understanding for viewers and listeners. We aim to tackle this issue by creating a cloud-based system that provides real-time voice translation for educational content."
              actions={
                <Button
                  variant="primary"
                  onClick={handleLogoout}
                >
                  Logout
                </Button>
              }
            >
              Real-Time Voice Translation and Input Voice simulator
            </Header>
          </SpaceBetween>
        }
      >
      <Tabs
        tabs={[
          {
            label: "File Upload",
            id: "first",
            content: <UploadTab></UploadTab>
          },
          {
            label: "All Files",
            id: "second",
            content: <AllFiles></AllFiles>
          },
          {
            label: "Recommendations",
            id: "third",
            content: <Recommendations></Recommendations>
          },
        ]}
        variant="container"
      />
        
    </ContentLayout>
  )
}

export default Dashboard