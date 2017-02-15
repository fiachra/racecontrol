# Simple Race Managment App

## Installation

```sh
npm install
```

Authentication is provided 3rd party by stormpath. You must create as .env file in the project route and include the stormpath keys

```sh
export STORMPATH_API_KEY_ID=xxx
export STORMPATH_API_KEY_SECRET=xxx
export STORMPATH_APP_HREF=xxx
export EXPRESS_SECRET=xxx
export AWS_ACCESS_KEY=xxxxxx
export AWS_SECRET_KEY=xxxxxx
```
The same will probably for for 
IAM keys when I get it done. Once you create the file you need to run

```sh
source .env
```

## Usage

When all the above setup is complete, to run the app to run:

```sh
npm start
```

## Amazon Web Services
Data storage is all managed using AWS's Dynamo DB. This way there was no need to pre-provision any db instances. I'm only paying for input and output which isn't very much. 
AWS keys are picked up from enviroment varibles like the stormpath keys. 
  
