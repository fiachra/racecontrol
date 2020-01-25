rsync -rave "ssh -i ../ExpressApps/RaceControl/race-control.pem" --exclude node_modules/ --exclude pouchdb/ ./* ubuntu@ec2-63-32-37-158.eu-west-1.compute.amazonaws.com:~/app/racecontrol
