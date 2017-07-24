'use strict'
// fix the default logging pluging, thx.
// const log = e => require('k-log')(e + "\n", "euphoria-cli.log",true)
const WebSocket = require('ws')
const color = require('./lib/color')
const tab = require('./lib/tab')
const blessed = require('blessed')

// Adding the main screen, we will append the tabs to it.

let main = blessed.screen({smartCSR: true})

/* Connection types below */
const euphoriaConnection = require('euphoria-connection')
const instantConnection = require('instant-connection')
// I would like to add discord and IRC.

// on ctrl + i, create an instant tab.
main.key(['C-i'], function (ch, key) {
	main.prepend(new tab("instant", new instantConnection()))
	main.children[0].focus()
})

// on ctrl + e, create an instant tab.
main.key(['C-e'], function (ch, key) {
	main.prepend(new tab("euphoria", new euphoriaConnection()))
	main.children[0].focus()
})


// Quit on Escape or Control-C.
main.key(['escape', 'C-c'], function (ch, key) {
	return process.exit(0)
})

// Add a nice placeholder screen.
main.append(
	blessed.box({
		top: '0',
		left: '0',
		color: 'blue',
		valign: 'middle',	
		align: 'center',
		width: '100%',
		height: '100%',
		content: 
`
00000000000000000
000000000000000000000
00000000000000000000000
00000000000000000000000
00000000000000000000000
00000000000000000000000
00                   00
000                 000
0000               0000
0000           0000
000000000000000 
		`,
		style: {
			fg: 'blue'}
	}))

// Render the main screen.
main.render()

// Render it again every 33ms, so that we can see changes.
setInterval( _ => main.render(), 33)

