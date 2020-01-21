# pylos

Web version of [pylos](https://cdn.1j1ju.com/medias/cd/27/c5-pylos-rulebook.pdf) board game

Production instance: https://pylos-5b63e.firebaseapp.com

## how to play
* Open https://pylos-5b63e.firebaseapp.com and click `play` button.
* After the game board is loaded click the share icon
* Send shareable url to a friend
* Click (or touch) on any of the ball slots to insert a ball

## development

### requirements
* node version: 12.14+
* yarn version: 1.21+

### local setup

```sh
# install dependencies
yarn install

# automatically build project on changes
yarn watch
```

in a separate terminal run an http server from `dist` directory

### run tests

```sh
# linux/mac
yarn test

# windows
yarn win:test
```

### deploy

```sh
# requires firebase authentication
firebase deploy
```
