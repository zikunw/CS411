# Data model
Data model that will be implemented in the firebase.

## Users related

### users/{user}
User information.

Key: uid (come from google OAuth)

Fields:
1. username (customizable)
2. profile picture url
3. \[posts\]
4. \[groups\]

### usernames/{username}
Username that is different from the google username. Customizable to the user. No duplication.

Key: username

Value: Google OAuth uid 

## Community related

### communities/{community}

Basic unit of community.

Key: group name

Fields:
1. group description
2. creation date
3. catelog
4. \[users\]
5. \[posts\]

### communities/{community}/posts/{post}

Post under a community.

TODO

### communities/{community}/users/{user}

User under a community.

Key: uid
