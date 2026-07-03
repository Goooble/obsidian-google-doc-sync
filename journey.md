# Learning the plugin

This has actually been quite fun ngl. Its really intuitive, settings, commands, modals and everything. what blows my mind is its all pure js and no frontend library. thats kinda insane to me but good for me, they have made building simple UI very easy

Callbacks were not intuitive for commands, but its a good learning experience either way. Classes also, since its very common in codebases so lvoely learning

# Blew up the repo

Accidentally pressed delete plugin and the folder got nuked. Directly. No trash. but thankfuck i had my my two three files open in teh editor so i just directly saved it and Modals file got blown up so had to ask copilot to generate slop.

# Sync manager

Finally moving towards sync features, important note

Modals and commands => only for UI, nothing else.
Everything else is business logic, interface properly

# Types and plugin data

Bro what
What data should Sync manager have access to and why does plugin.data need a data handler when its always accessible to everythign anyways???? TODO, only accessible through data handler
but tehn save and load are defined on the plugin :sob: what even is going on software is so hard

you konw we dont care king, we move on. I dont have enough experience to figure this shit out but refactoring is always a possiblity

# Local provider

woah so much fun. the idea of implementing the sync manager with a simplified mock local provider is really fucking cool. I should remember this patter. So later i can swap local provider with an actual GDocs api

I guess the important idea is the local provider should act like a stub, or should be simple enough so that you can get teh core logic down

# Keep UI and Business separate!

Do not mix up the Commands and sync manager, both should have their own error handling always.
Commands are only one way to access the sync manager, so the manager should remember that and do its own error handling no matter what.
