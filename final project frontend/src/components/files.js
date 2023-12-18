import * as React from "react";
import {useEffect} from 'react'
import Cards from "@cloudscape-design/components/cards";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
//import audioFile from './file_example_OOG_5MG.ogg';
import ReactAudioPlayer from 'react-audio-player';
// login session
import userpool from '../userpool'

export default () => {

  const [cardItems, setCardItems] = React.useState([]);
  const [selectedItems, setSelectedItems] = React.useState();

  function sendRequest() {
    // send requests to backend
    var url = "https://tjncczsox6.execute-api.us-east-1.amazonaws.com/stage1/userFiles?username=";
    let username = userpool.getCurrentUser().username;
    url += username;
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
  };

  useEffect(()=>{
    sendRequest();
  },[]);
  
  return (
    <SpaceBetween>
      <h3>Select each audio file to play</h3>

      <SpaceBetween  alignItems="center">
        <SpaceBetween direction="horizontal" size='s'>
          <h4>Play Original Audio:</h4>
          <ReactAudioPlayer
            src={selectedItems !== undefined && selectedItems.length === 1 && selectedItems[0].presigned_url}
            controls
          />
          <h4>Play Transcribed Audio: </h4>
          {selectedItems !== undefined && selectedItems.length === 1 && <ReactAudioPlayer
            src={selectedItems !== undefined && selectedItems.length === 1 && selectedItems[0].s3_after_translation}
            controls
          />}
        </SpaceBetween>
      </SpaceBetween>
      
      
      <Cards
        onSelectionChange={({ detail }) =>
          setSelectedItems(detail?.selectedItems ?? [])
        }
        selectedItems={selectedItems}
        cardDefinition={{
          header: item => (
            item.original_file_name
          ),
          sections: [
            {
              id: "public",
              header: "Open to Public",
              content: item => String(item.is_public)
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
            }
          ]
        }}
        cardsPerRow={[
          { cards: 1 },
          { minWidth: 500, cards: 2 }
        ]}
        items={cardItems}
        loadingText="Loading resources"
        selectionType="single"
        trackBy="original_file_name"
        visibleSections={["public", "description", "size", "source_to_target"]}
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
        entireCardClickable
    />
    </SpaceBetween>
    
  );
}

/* an example
{
    "list": [
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
    ]
}

pre-signed URL: https://audio-before-translation.s3.us-east-1.amazonaws.com/55143e6776f53f54e3748d8f905887dc8927bba7e68163ab67431cfb2ce447c3?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjENH%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIAD8YdaAdODMA2Ie4Z8ral%2F1cGfsYLy78AWhbEhL1ABhAiBjR5gFOSlbV%2BXzBkyFr%2B%2BJfVQDx7VaYyhkbcGrQVffSyrkAghKEAEaDDAyNjU5MzUzNzYzMSIMnjYubXy8mAPjVuY3KsECusYaD4mio7smiTbgOFCpLeOZHdpwmKEJYglhm1PMuvQMouXITlAL%2BzALQqK%2BZm3pIjUrXeKXCMXnh%2F0UqXrxs%2BPuvJmqL2SVeZYH8BJ2O0ODu09ybV%2BgpvVC9sKo5kgQGmwxT8%2Baf3OcKidtETrK5h5PsP023XCcjjB0CNDYZIuuofUFI%2B4easPTVqOOIJqk4027QPvqQY5U1WML3gK%2BXgKejXjLW5tVxZpiW%2B8zBn1kX2%2BWzirjtK1TQjR%2BjX0smUDNLz%2FhQX%2BDHh54QliyQo8sQiINFTqzy8namng8qtlxLwGivUZoemWKMKiOWY74kKdeDH4AkbLPDryGUuJcP5Lv6m5mRCa7LqTF1wZYBmyjw2nhKCufyyzvcDYGwrs5LCA8l0uqW8t%2BowL5Xmw1hAJkx%2F%2F1BPEzFkuTZALMmXOkMNrA56sGOrQCtl2N0ncjOWPpLblsivV6sDB4628btVQCpvarpOWsc2D7bhvmsltIXfGP8gC%2ByHDqd4mp1xeH7qzwLDpO6ezGAh70pBLflbyJmamCbSI%2FpvxGTDRvgEa21urR8H2%2BVF0gUwHrVYDIEiGge15NCetfvpUG7qfvzJ%2FK38gesTB8UQs0tKVBTfwgJolXkXr2DyZ4%2F8%2BNmRzp93dUaSL547qOafYY4lW%2BsHzHptSa%2FcfUwl1%2FufwMJEkUh%2FuxRyGXYAoaPmPdlfwuLIvcQODNZd6CZpI%2BPbN4uPh%2BUA4t1GhkQnNd7RlGcO7cOwajbCRVRwoETeVC7O8x5UBsMADchDrfdEUfzDGx8Q3HtZAZsWvWvH2aml6zyCshk4mMSxvi9G5tpQ3tSEz%2F7obBn3FfubJ8ZwdsMMU%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20231213T200628Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAQMMIZFZPQ7ZVNJGX%2F20231213%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=7a3f61088b2864512d36bf3b71cbdf8e3fe7e2d460bc494eb3dd598ed4304e51
*/