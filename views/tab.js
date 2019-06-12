const blessed = require('blessed')

class tab extends blessed.Box {
	constructor(room, connection, parent) {
		super({
			keys: true,
			mouse: true,
		});

		this.title = `euphoria-TUI`;

		const main = blessed.List({
			parent: this,
			top: 0,
			left: 0,
			width: '100%',
			keys: true,
			mouse: true,
			scrollable: true,
			height: '94%',
			tags: true,
			label: `{bold}{blue-bg}&${room}{/blue-bg}{/bold}`,
			border: 'line',
			style: {
				focus: {
					bg: 'blue'
				},
				fg: 'white',
				scrollbar: true,
				border: {
					fg: '#f0f0f0'
				}
			}
		})

		const userlist = blessed.List({
			parent: this,
			top: '0',
			right: '0',
			width: '30%',
			height: '94%',
			tags: true,
			label: `{bold}users{/bold}`,
			mouse: true,
			keys: true,
			scrollable: true,
			border: 'line',
			style: {
				scrollbar: true,
				fg: 'white',
				border: {
					fg: '#f0f0f0'
				}
			}
		})

		const form =  blessed.Form({
			parent: this,
			bottom: 0,
			right: 0,
			width: '100%',
			height: '8%',
		})

		form.on('submit', content => {
			this.connection.post(content.post);
		})


		const button = blessed.Button({
			parent: form,
			bottom: 0,
			right: 0,
			width: '30%',
			height: '100%',
			border: 'line',
			style: {
				scrollbar: true,
				fg: 'white',
				border: {
					fg: '#f0f0f0'
				}
			}
		})

		button.on('press', function() {form.submit()})

		const text = blessed.Textbox({
			parent: form,
			bottom: 0,
			left: 0,
			keys: true,
			vi: false,
			mouse: true,
			color: 'white',
			width: '70%',
			height: '100%',
			border: 'line',
			name: 'post',
			style: {
				fg: 'white',
				focus: {
					bg: 'blue'
				},
				border: {
					fg: '#f0f0f0'
				}
			}

		})

		this.main = main;
		this.button = button;
		this.userlist = userlist;
		this.text = text;
		this.log = [];
		text.focus();
		button.addListener('click', () => {
			form.submit();
		})
		this.connection = connection


		text.addListener('submit', () => {
			form.submit();
		})

		connection.on('ready', json => {
			connection.nick()
			connection.download(20)
			connection.who()
		})
		connection.on('send-event', json => {
			const data = json.data;
			this.log.push(data);
			sort(this.log, this.main);
			this.main.move(1);
			this.main.render();
		})
		connection.once('log-reply', json => {
			const data = json.data;
			this.log = data.log;
			sort(this.log, this.main);
			this.render();
		})
		connection.on('who-reply', json => {
			const data = json.data;
			this.userlist.setItems(data.listing.map(user => user.name));
			this.userlist.move(1);
			this.render();
		})
	}
}

function sort (posts, main) {
	let result = [];
	const root = [];

	for (let i = 0; i < posts.length; i++) {
    let post = posts[i];
    let parent = post.parent;
    console.log(parent);
    if (parent) {
      if (root[parent.id] !== void(0)) {
        root[parent.id].children.push(post);
      } else {
        root[parent.id] = parent;
        root[parent.id].children = [post];
      }
    } else { // post is root
      if (root[post.id]) // ?????
        process.exit();
      root[post.id] = post;
      root[post.id].children = [];
    }
  }

  // Object.keys(root).forEach(function(key) {
  //   result = result.concat(render_post(main, root[key]))
  // })

  // main.setItems(result);
}

function render_post(main, post, depth = 0, item = []) {
  padding = '';
  for (let i = 0; i < depth; i++) {
    padding += ' ';
  }
  item.push(`${padding} ${post.sender.name} ${post.content} ${depth} `);
	if(post.children) {
	  post.children.forEach(child => {
      item = item.concat(render_post(main, child, ++depth, item));
    });
	}
  return item;
}

module.exports = tab
