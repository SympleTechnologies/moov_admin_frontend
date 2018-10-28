//localStorage.setItem('token', '5a1365473e1490c4a1f40054f9e1b360610a06ff2bbe2dd017412335f490dabe');

const filters = {
	users: {page:1, limit: 20},
	drivers: { page:1, limit: 20 }
};

const app = {
	api: "http://localhost:8000/api/v2",

	login: async () => {
		app.loading();

		try{
			let data = {
				username: document.getElementById('username').value,
				password: document.getElementById('password').value
			};
			result = await fetch(app.api + "/school", {
				headers: new Headers({'Content-Type': 'application/json'}), 
				method:'POST', body: JSON.stringify(data) })
			resp = await result.json()

			app.finished()

			if(resp.status == 200){
					localStorage.setItem('token', resp.token);
					localStorage.setItem('home', location.href );
					location.href = "dashboard.html";
			}
			else{
				alert(resp.message)
			}
		}
		catch(e){
			app.finished();
		}
	},

	getUsers: async () => {
		app.loading();

		try{
			result = await fetch(`${app.api}/school/users/${filters.users.page}/${filters.users.limit}` , {
				headers: new Headers({'Content-Type': 'application/json', 'Token': localStorage.getItem('token')}), 
				method:'GET' })
			resp = await result.json()

			let html = ""
			if(resp.users){
				for(i in resp.users){
					user = resp.users[i]
					html += `
						<tr>
							<td>${user.id}</td>
							<td>${user.firstname}</td>
							<td>${user.lastname}</td>
							<td>${user.email}</td>
						</tr>
					`
				}

/* --------- PAGINATION ------------------- find a way to abstract this for all lists */
				let page = resp.page;
				let totalPages = resp.totalPages;
				if(totalPages > page){
					if(page == 1){
						let row = `
							<tr>
								<td> <button onclick="filters.users.page++; app.getUsers()">Next</button> </td>
							</tr>
						`;
						html += row;
					}
					else{
						let row = `
							<tr>
								<td> <button onclick="if(filters.users.page == 1){ return; } filters.users.page--; app.getUsers();">Prev</button> </td>
								<td> </td>
								<td> </td>
								<td> <button onclick="filters.users.page++; app.getUsers()">Next</button> </td>
							</tr>
						`;
						html += row;
					}
				}
				else{
					let row = `
						<tr>
							<td> <button onclick="if(filters.users.page == 1){ return; } filters.users.page--; app.getUsers();">Prev</button> </td>
						</tr>
					`;	
					html += row;
				}
/* ----------- END PAGINATION ============== */

				document.getElementById("usersbody").innerHTML = html;
			}

			app.finished()
		}
		catch(e){
			app.finished();
		}
	},

	logout: () => {
		localStorage.removeItem('token');
		location.href = localStorage.getItem('home');
	},

	loading: () => {
		ld = document.createElement("div");
		ld.id = "loaderdiv";
		ld.innerHTML = '<div class="loader"> <img src="../assets/img/loader.gif" width="90px" /> </div>';
		document.body.appendChild( ld );
	},

	finished: () => {
		document.getElementById('loaderdiv').remove();
	},


	// drivers

	getDrivers: async () => {
		let route = `${app.api}/school/drivers/${filters.drivers.page}/${filters.drivers.limit}`;
		app.loading()

		try{
			result = await fetch(route, {
				headers: new Headers({'Content-Type': 'application/json', 'Token': localStorage.getItem('token')}), 
				method:'GET' })
			resp = await result.json()

			if(resp.status == 200){
				app.renderDriversAsTable(document.getElementById('driverslist'), resp.drivers )
			}else{
				alert(resp.message)
			}

			app.finished();
		}
		catch(e){
			app.finished()
		}
	},

	renderDriversAsTable: ( container, drivers ) => {
		let html = "";
		for(i in drivers){
			let driver = drivers[i]
			let row = `
				<tr>
					<td>${driver.id}</td>
					<td>${driver.firstname}</td>
					<td>${driver.lastname}</td>
					<td>${driver.approved}</td>
				</tr>
			`
			html += row;
		}

		/* --------- PAGINATION ------------------- find a way to abstract this for all lists */
				let page = resp.page;
				let totalPages = resp.totalPages;
				if(totalPages > page){
					if(page == 1){
						let row = `
							<tr>
								<td> <button onclick="filters.drivers.page++; app.getDrivers()">Next</button> </td>
							</tr>
						`;
						html += row;
					}
					else{
						let row = `
							<tr>
								<td> <button onclick="if(filters.drivers.page == 1){ return; } filters.drivers.page--; app.getDrivers();">Prev</button> </td>
								<td> </td>
								<td> </td>
								<td> <button onclick="filters.drivers.page++; app.getDrivers()">Next</button> </td>
							</tr>
						`;
						html += row;
					}
				}
				else{
					let row = `
						<tr>
							<td> <button onclick="if(filters.drivers.page == 1){ return; } filters.drivers.page--; app.getDrivers();">Prev</button> </td>
						</tr>
					`;	
					html += row;
				}
/* ----------- END PAGINATION ============== */

		container.innerHTML = html;
	},


	stats: async () => {
		app.loading();

		result = await fetch(`${app.api}/school/stats` , {
				headers: new Headers({'Content-Type': 'application/json', 'Token': localStorage.getItem('token')}), 
				method:'GET' })
			resp = await result.json()

			if(resp.status == 200){
				$('#t1').text( resp.totalUsers);
				$('#t2').text( resp.totalDrivers);
				$('#t3').text( resp.wallet_balance);
				$('#t4').text( resp.price_share.moov);
				$('#t5').text( resp.price_share.driver);
				$('#t6').text( resp.price_share.school);
			}else{
				//
			}

		app.finished();
	}
}