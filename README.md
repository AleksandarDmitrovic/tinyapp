# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).
Once a user is logged in they can view their shortened urls. On the Edit page for each URL one can view analytics of how many times a given short url was visited, how many UNIQUE visitors visited and a list of every visit.

I added method-override middleware to make PUT and DELETE requests in the server file.


## Final Product

!["screenshot description"](#)
!["screenshot description"](#)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- method-override
- date-fns
- date-fns-timezone

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.