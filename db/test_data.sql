INSERT INTO users (
    loginname, email, password,	secretquestion,	
    secretanswer, apikey, webhook, confirmemail, 
    resetpassword, exchangelist, defaultexchange, ratelimit)
VALUES 
(	'test',	'test@test.com',	'735a2320bac0f32172023078b2d3ae56',	'hello',	
'69faab6268350295550de7d587bc323d',	'c0i3dun48v6qfc9d1p5g',	'test1',	'1',	
'5e6881d07b0c883e318f7ede5b616408',	'US',	'US',	30	),
(	'test2',	'',	'735a2320bac0f32172023078b2d3ae56',	'hello',	
'69faab6268350295550de7d587bc323d',	'',	'',	'071e3afe81e12ff2cebcd41164a7a295',	
'0',	'US',	'US',	30	)

INSERT INTO newemail (userid, newemail, querystring)
VALUES ((SELECT id from users where loginname = 'test2'), 'test2@test.com', '071e3afe81e12ff2cebcd41164a7a295')

--login for test accounts is testpw
--might need to update pw on rebuild of db, not sure how md5 works.