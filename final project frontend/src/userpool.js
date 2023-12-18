import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: "us-west-2_OyQKNw0Yb",
  ClientId: "3rcdd70up1m9p40cv91i0mj020",
};

export default new CognitoUserPool(poolData);