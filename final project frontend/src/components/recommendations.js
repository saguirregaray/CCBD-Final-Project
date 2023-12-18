import * as React from "react";
import {useEffect} from 'react'
import Cards from "@cloudscape-design/components/cards";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Select from "@cloudscape-design/components/select";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
// audio player
import ReactAudioPlayer from 'react-audio-player';
// login credentials
import userpool from '../userpool'

export default () => {
  const [
      selectedOption,
      setSelectedOption
  ] = React.useState({ label: "English", value: "1" });
  const [cardItems, setCardItems] = React.useState([]);

  function sendRefreshRequest(){
    let currentUsername = userpool.getCurrentUser().username;
    // send requests to backend
    var url = "https://tjncczsox6.execute-api.us-east-1.amazonaws.com/stage1/recommend?username=";
    url += currentUsername;
    console.log("sending requests to", url);
    const requestOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    };
    fetch(url, requestOptions)
        .then((response) => {
            return response.json();
        })
        .then((json_response)=>{
            console.log(json_response);
            setCardItems(json_response['list']);
        });
  }

  useEffect(()=>{
    sendRefreshRequest();
  },[]);

  function handleUserLike(username, filename) {
    let currentUsername = userpool.getCurrentUser().username;
    // send requests to backend
    var url = "https://tjncczsox6.execute-api.us-east-1.amazonaws.com/stage1/getLikes?like=";
    url += currentUsername + "/" + username + "/" + filename;
    console.log("sending requests to", url);
    const requestOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    };
    fetch(url, requestOptions)
        .then((response) => {
            return response.json();
        })
        .then((json_response)=>{
            console.log(json_response);
        });
  };

  const getRecommendation=()=>{
    console.log("get feed");
    sendRefreshRequest();
  };

  return (
    <SpaceBetween size='m'>
      
      <Container>
      <SpaceBetween direction="horizontal" size='m' alignItems="center">
        <p><strong>Please select the language you are interested in, and click the button</strong></p>
        <Select
          selectedOption={selectedOption}
          onChange={({ detail }) =>
            setSelectedOption(detail.selectedOption)
          }
          options={[
            { label: "English", value: "1" },
            { label: "French", value: "2" },
            { label: "Chinese", value: "3" },
            { label: "Korean", value: "4" },
            { label: "Spanish", value: "5" }
          ]}
        />
        <Button variant="primary" onClick={getRecommendation}>Refresh Posts</Button>
      </SpaceBetween>
      </Container>

      <Cards
        cardDefinition={{
          header: item => (
            item.original_file_name
          ),
          sections: [
            {
              id: "play",
              header: "Click to Play",
              content: item => (<ReactAudioPlayer
                  src={item.presigned_url}
                  controls
                />)
            },
            {
              id: "description",
              header: "Description",
              content: item => item.description
            },
            {
              id: "source_to_target",
              header: "Source and Target",
              content: item => "Transcribed from " + item.source_language + " to " + item.target_language
            },
            {
              id: "size",
              header: "Size",
              content: item => item.file_size
            },
            {
              id: "like",
              header: "I like this podcast!",
              content: item => (<Button onClick={() => {
                console.log("current user likes this audio file", item.original_file_name);
                handleUserLike(item.username, item.original_file_name);
              }}>Like</Button>)
            },
          ]
        }}
        cardsPerRow={[
          { cards: 1 },
          { minWidth: 500, cards: 1 }
        ]}
        items={cardItems}
        loadingText="Loading resources"
        visibleSections={["play", "description", "size", "source_to_target", "like"]}
        empty={
          <Box
            margin={{ vertical: "xs" }}
            textAlign="center"
            color="inherit"
          >
            <SpaceBetween size="m">
              <b>No resources</b>
            </SpaceBetween>
          </Box>
        }
      />
      
    </SpaceBetween>
  );
}

/*
{
    "file_name": "686641316ee64354ad6bf4ab89c7a958754f4b3be01d4b54e55bfc0e26a46df6",
    "source_language": "English",
    "target_language": "Spanish",
    "is_public": true,
    "description": "this is the first audio file I uploaded.",
    "original_file_name": "Conon O'brand.mp3",
    "before_path": "http://audio-before-translation.s3-website-us-east-1.amazonaws.com/686641316ee64354ad6bf4ab89c7a958754f4b3be01d4b54e55bfc0e26a46df6.mp3",
    "file_size": 3694208,
    "labels": [
        null
    ],
    "username": "1e73d012-8223-4f42-a2a7-5cb5f732614f",
    "presigned_url": "https://audio-before-translation.s3.amazonaws.com/Conon%20O%27brand.mp3?AWSAccessKeyId=ASIAQMMIZFZP3YEZGOUQ&Signature=%2FEg8rAmrC3WuCkr%2BZmkTU5C%2Bp40%3D&x-amz-security-token=IQoJb3JpZ2luX2VjENf%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIAGKMOQv5%2FTtGCdcark8ceTCbMnio1AWQdH5Xs9UaawYAiEAsW0pT3YVguU6HVFefQEewCmi3eLB1crVeOoDP9BgbC4q%2FgIIUBABGgwwMjY1OTM1Mzc2MzEiDAAEl92D7TgcKZa2birbAms5tsb0rlFy3Ll078YgbfAC%2BMc7JuuSd97q8AbPkXentoVsIniwUMRjaDPddh0fE94xhEWMk7uvUzWRLZxwhwBYEp9f0WRs6VjNgwc%2FuVNVl40lRKH5RHtx%2FKRdQRQmq3bSxvun8UrunM55kiIR7ebJuXQ84cb%2BKVS7OUwx0rlbZ7RxgfBv2lJvSV4pxAa23qf9vEx3Sn6RK50hvdKN%2ByvcR9LZ0LRTitG3j4WltExohVHgOT8GU6olk%2BLf1Ppc%2Bq8698atipPts3WYi%2B1ScN8TFb1FBPePEFhjkgG2q81hIHUw3suejtrgatoSn7qamAsb%2F4sDpe60bQsryNp3JRI6b7l8SyQzG%2FVKEyURUtyzkhOZ3mQZjYk6FR4JBIU4qtLjMAv5q4ABovxLRTlQEdj8i74b01f%2BnSjlyCreoipMMfSPiv2pPnuA%2Fw8NAoTggFbCZydVZsvXNzR0MJ3j6KsGOp4Bzs5kVGdERi6Wagleg%2BV8Ak78zteB4%2B%2FGBVEqxkGhiSXxKBVayNB6b16FA2AUFp8ErpNaiSJfF1e5PKC9aL6gh%2F57aWrsP1kZk8CYDq5mtMv02INUBkxmp%2FPwV7qMq94AEVVGvay95TdSqLwrwVGG84IMIQKsho4L4wGsT8zVcD4L%2BpMlhTwNOOpdFF6x0Oe7JrLg%2BSLzlzGIfyIkmAg%3D&Expires=1703111780"
}
*/