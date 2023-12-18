// React
import * as React from "react";
// AWS Cloudscape
import Container from "@cloudscape-design/components/container";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import FormField from "@cloudscape-design/components/form-field";
import FileUpload from "@cloudscape-design/components/file-upload";
import Select from "@cloudscape-design/components/select";
import Input from "@cloudscape-design/components/input";
import Modal from "@cloudscape-design/components/modal";
import Checkbox from "@cloudscape-design/components/checkbox";
// sending requests
import axios from 'axios';
// login session
import userpool from '../userpool'

const hashValue = val =>
  crypto.subtle
    .digest('SHA-256', new TextEncoder('utf-8').encode(val))
    .then(h => {
      let hexes = [],
        view = new DataView(h);
      for (let i = 0; i < view.byteLength; i += 4)
        hexes.push(('00000000' + view.getUint32(i).toString(16)).slice(-8));
      return hexes.join('');
    });

console.log(String(Date.now()), hashValue(String(Date.now())).then(
  (value) => {
    console.log(value);
  }
));

export default () => {
    const [value, setValue] = React.useState([]);
    
    const [
        selectedOption,
        setSelectedOption
    ] = React.useState({ label: "English", value: "1" });
    const [
        selectedOption1,
        setSelectedOption1
    ] = React.useState({ label: "Spanish", value: "1" });

    const [email, setEmail] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [checked, setChecked] = React.useState(false);

    const [failureModalVisible, setFailureModalVisible] = React.useState(false);
    const [successModalVisible, setSuccessModalVisible] = React.useState(false);

    function handleSubmit(event) {
      event.preventDefault()
      // check if file is empty
      if(value.length === 0 || value[0].name === undefined){
        setFailureModalVisible(true);
        return;
      }
      if(selectedOption.label === selectedOption1.label){
        setFailureModalVisible(true);
        return;
      }
      if(email === ""){
        setFailureModalVisible(true);
        return;
      }
      var hashkey = value[0].name + String(Date.now());
      hashValue(hashkey).then(
        (generatedHashValue) => {
          let fileFormat = value[0].name.split('.');
          console.log(fileFormat[fileFormat.length-1]);
          if (fileFormat[fileFormat.length-1] !== 'mp3'){
            setFailureModalVisible(true);
            return;
          }
          var url = 'https://tjncczsox6.execute-api.us-east-1.amazonaws.com/stage1/audio-before-translation/';
          url = url + generatedHashValue + '.' + fileFormat[fileFormat.length-1];
          let username = userpool.getCurrentUser().username;

          const config = {
            headers: {
              'Content-Type': 'audio/mpeg',
              'x-amz-meta-targetLanguage': selectedOption1.label,
              'x-amz-meta-sourceLanguage': selectedOption.label,
              'x-amz-meta-userEmail': email,
              'x-amz-meta-description': description,
              'x-amz-meta-isPublic': (checked === true),
              'x-amz-meta-originalFileName': value[0].name,
              'x-amz-meta-hashFileName': generatedHashValue,
              'x-amz-meta-username': username,
            },
          };
          console.log(value, value[0].name, value[0], Object.keys(value[0]));
          console.log("sending request to", url, "with headers:", config);
          axios.put(url, value[0], config).then((response) => {
            console.log(response.data);
          });
          setValue([]);
          setSuccessModalVisible(true);
        }
      );
    }
    
    return (
        <Container>

          <h4>At this stage, we only support .mp3 file format.</h4>

          <Modal
            onDismiss={() => setFailureModalVisible(false)}
            visible={failureModalVisible}
            header="Fail to Submit"
          >
            You need to make sure:
            (1) The file is an audio file
            (2) You left a correct email address so we can contact you
            (3) Your source language and target language should not be the same
          </Modal>

          <Modal
            onDismiss={() => setSuccessModalVisible(false)}
            visible={successModalVisible}
            header="Successfully Uploaded"
          >
            Your file is successfully uploaded. Please wait for a few minutes to download.
          </Modal>

          <SpaceBetween size="m">
          <FormField label="Step 1: Please upload your target file">
            <FileUpload
              onChange={({ detail }) => setValue(detail.value)}
              value={value}
              i18nStrings={{
                uploadButtonText: e =>
                  e ? "Choose files" : "Choose file",
                dropzoneText: e =>
                  e
                    ? "Drop files to upload"
                    : "Drop file to upload",
                removeFileAriaLabel: e =>
                  `Remove file ${e + 1}`,
                limitShowFewer: "Show fewer files",
                limitShowMore: "Show more files",
                errorIconAriaLabel: "Error"
              }}
              multiple
              showFileLastModified
              showFileSize
              showFileThumbnail
              tokenLimit={3}
            />
          </FormField>

          <FormField label="Step 2: Please select source and target language">

          <SpaceBetween direction="horizontal" size="m">
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
            <Select
              selectedOption={selectedOption1}
              onChange={({ detail }) =>
                setSelectedOption1(detail.selectedOption)
              }
              options={[
                { label: "English", value: "1" },
                { label: "French", value: "2" },
                { label: "Chinese", value: "3" },
                { label: "Korean", value: "4" },
                { label: "Spanish", value: "5" }
              ]}
            />
          </SpaceBetween>

          </FormField>

          <FormField label="Step 3: Please leave your email address so that we can contact you upon finish">
            <Input
              onChange={({ detail }) => setEmail(detail.value)}
              value={email}
            />
          </FormField>

          <FormField label="Step 4: If you want to make this public, click the checkbox and optionally enter some description">
            <Checkbox
              onChange={({ detail }) =>
                setChecked(detail.checked)
              }
              checked={checked}
            >
              I want to make this audio file public
            </Checkbox>
            <Input
              onChange={({ detail }) => setDescription(detail.value)}
              value={description}
            />
          </FormField>

          <Button variant="primary" onClick={handleSubmit}>Convert</Button>
          
        </SpaceBetween>
        </Container>
    );
}