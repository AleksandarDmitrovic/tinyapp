# TinyApp Project

TinyApp is a full-stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).
Once a user is logged in they can view all their shortened URLs. This page included analytics of how many times a given short URL was visited, how many UNIQUE visitors visited and the date the URL was created. On the Edit page for each URL one can view the previously mentioned analytics and a list of every visit with a timestamp.

I added method-override middleware to make PUT and DELETE requests in the server file.


## Final Product

!["Screenshot of URLs page"](https://github.com/AleksandarDmitrovic/tinyapp/blob/master/docs/urls-page.png?raw=true)
!["Screenshot of Shortened URL Edit page"](https://github.com/AleksandarDmitrovic/tinyapp/blob/master/docs/urls_:id-page.png?raw=true)
!["Screenshot of Create New URL page"](https://github.com/AleksandarDmitrovic/tinyapp/blob/master/docs/urls_new-page.png?raw=true)

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