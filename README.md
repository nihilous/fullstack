Link to an address.
Client Page:
http://34.88.151.132/
Admin Page:
http://34.88.151.132/admin/login

Admin account join secret key : admintest

User Instruction.
New Born to 16 Years old Vaccination Recommendation with 4 Languages finnish, swedish, english, korean( Easily expendable)
With user, child info, vaccination history modification, deletion
BBS include reply, both posting and reply can be modified or deleted.

Due to nationality of child, can get different vaccination guidelines.

Admin page can check whole users informations and suspicious attack log,
Can add temporal country, vaccination Information to organise data and extend datas ( not to harm proven regular datas)

Client main page is filterable.
Admin page user datas, suspect activity are filterable.

As common page, bbs page is filterable.

If admin check and white listed or banned , with crontab log will be deleted everyday and won’t be stacked any more
( since injection keywords are all decoded and encoded, to check if it was really attempting to injection)

Ban check is for GCP firewall, if add the IP then can check , so won’t stack log of attacker any more.
Deactivated user’s data will be removed as hard delete after 6 months without login with crontab works everyday.

Each of response and error will show pop up.

Without renewing of JWT will automatically logout user after warning.
Warning : 50 mins
Logout : 60 mins 
For security JWT will be compared to database when it’s generated. So local forgery might not works.
For security, harmful keywords will be encoded and decoded again for get request.

Most of client pages are simple 3 depth responsive and so is admin pages except few.

Vaccine seed datas are for initial working, and from admin manage page, can stack new data, so when datas are stacked easily add new data on temporal data tables to select datas and insert into regular data tables.

Link to work hours listing.  https://github.com/nihilous/fullstack/blob/main/tuntikirjanpito.md

PS. Had been develop this project on GCP with dev mode deployment, very end of project, after deploy production build,
React Bootstrap didn’t work, so rollbacked to dev mode which works as I intend.
