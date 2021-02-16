INSERT INTO users (loginname, email, password,	secretquestion,	secretanswer, apikey, webhook, confirmemail, resetpassword, exchangelist, defaultexchange, ratelimit)
VALUES 
(	'test',	'glennstreetman@gmail.com',	'735a2320bac0f32172023078b2d3ae56',	'hello',	'5d41402abc4b2a76b9719d911017c592',	'c0i3dun48v6qfc9d1p5g',	'test1',	'1',	'5e6881d07b0c883e318f7ede5b616408',	'US',	'US',	30	),
(	'test2',	'glenntest@glenntest.com',	'735a2320bac0f32172023078b2d3ae56',	'hello',	'a1d7d24ed1ed066c1f9292c42801018e',	'',	'',	'071e3afe81e12ff2cebcd41164a7a295',	'0',	'US',	'US',	30	)
--login for test is testpw
--might need to update pw on rebuild of db, not sure how md5 works.