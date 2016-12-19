# Simple Race Managment App

## Installation

```sh
npm install
```

You must create as .env file in the project route and include the stormpath keys

```sh
export STORMPATH_API_KEY_ID=xxx
export STORMPATH_API_KEY_SECRET=xxx
export STORMPATH_APP_HREF=xxx
export EXPRESS_SECRET=xxx
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

## ToDo
* Integrate AWS-SDK
* create IAM profile
* create user table dynamo DB
* create check-in table dynamo DB
* create Pages
  * Admin page to add users
  * Admin page to Edit Users
  * page to list users
  *	page to list checkins
  * page for checkin
  
