# meteor-chat
A chat that alllows global, private and group chat, with options to add friends, see who's online, etc. It was made to help me in learning Meteor when i first started so it isn't using the best practices.


Update :
Now it supports facebook login, and adds facebook friends automatically to friends list if they logged in at least once in this app. You can still remove them if you want.

It also supports file uploading and downloading on chat. It can accept files up to 10MB and deletes them after a month passes (every first day of the month, a job is executed that checks if the file is over 1 month old and deletes it. When the user tries to download it, an error will be shown prompting him that the file has expired).

Live demo:
http://calinachat.herokuapp.com/
