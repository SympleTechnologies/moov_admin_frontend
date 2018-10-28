//localStorage.setItem('token', '5a1365473e1490c4a1f40054f9e1b360610a06ff2bbe2dd017412335f490dabe');

const filters = {
	users: {page:1, limit: 20, a: false, s: false, d: false}, // active, suspended, deactivated
	rides: { page:1, limit: 20, for:'user', id: 0 }
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
			result = await fetch(app.api + "/admin", {
				headers: new Headers({'Content-Type': 'application/json'}), 
				method:'POST', body: JSON.stringify(data) })
			resp = await result.json()

			app.finished()

			if(resp.status == 200){
					localStorage.setItem('token', resp.token);
					localStorage.setItem('home', location.href);
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
	showadduser: () => {
		document.getElementById('addusermodal').classList.remove('hidden')
	},
	closeadduser: () => {
		document.getElementById('addusermodal').classList.add('hidden')
	},

	getUsers: async () => {
		app.loading();

		try{
			search = "";
			if(filters.users.a){ search = "?active=1"; }
			else if(filters.users.s){ search = "?suspended=1"; }
			else if(filters.users.d){ search = "?deactivated=1"; }

			result = await fetch(`${app.api}/admin/users/${filters.users.page}/${filters.users.limit}${search}` , {
				headers: new Headers({'Content-Type': 'application/json', 'Token': localStorage.getItem('token')}), 
				method:'GET' })
			resp = await result.json()

			let html = ""
			if(resp.users){
				for(i in resp.users){
					user = resp.users[i]
					html += `
						<tr onclick="app.userDetails(event, ${user.id})">
							<td>${user.id}</td>
							<td>${user.firstname}</td>
							<td>${user.lastname}</td>
							<td>${user.email}</td>
							<td>
								<div class="dropdown">
								  <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								    Actions
								  </button>
								  <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
								    <a class="dropdown-item" href="#">Reactivate User</a>
								    <a class="dropdown-item" href="#">Deactivate User</a>
								    <a class="dropdown-item" href="#">Reset User Password</a>
								    <a class="dropdown-item" href="rides.html?user=${user.id}">View User's Rides</a>
								  </div>
								</div>

							</td>
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

	addUser: async () => {
		app.loading();

		try{
			let data = {
				firstname: document.getElementById('cfirstname').value,
				lastname: document.getElementById('clastname').value,
				email: document.getElementById('cemail').value,
				role: document.getElementById('crole').value,
			};


			result = await fetch(app.api + "/admin/user", {
				headers: new Headers({'Content-Type': 'application/json', 'Token': localStorage.getItem('token')}), 
				method:'POST', body: JSON.stringify(data) })
			resp = await result.json()

			if(resp.status == 200){
				app.closeadduser(); 
				alert ("User Added");
			}
			else{ alert(resp.message); }


			app.finished()
			app.getUsers()
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
		ld.innerHTML = '<div class="loader"> <img src="assets/img/loader.gif" width="90px" /> </div>';
		document.body.appendChild( ld );
	},

	finished: () => {
		document.getElementById('loaderdiv').remove();
	},

	// Rides
	getRides: async () => {
		if(filters.rides.for == 'user'){
			await app.getUserRides();
		}
		if(filters.rides.for == 'driver'){
			await app.getDriverRides();
		}
		if(filters.rides.for == 'school'){
			await app.getSchoolRides();
		}
		if(filters.rides.for == 'all'){
			await app.getAllRides();
		}
	},
	getUserRides: async () => {
		let route = `${app.api}/admin/rides/user/${filters.rides.id}/${filters.rides.page}/${filters.rides.limit}`; 

		app.loading()

		result = await fetch(route, {
			headers: new Headers({'Content-Type': 'application/json', 'Token': localStorage.getItem('token')}), 
			method:'GET' })
		resp = await result.json()

		app.renderRides(document.getElementById('rides'), resp.rides )

		app.finished()
	},

	getSchoolRides: async () => {
		let route = `${app.api}/admin/rides/school/${filters.rides.id}/${filters.rides.page}/${filters.rides.limit}`;

		app.loading()

		result = await fetch(route, {
			headers: new Headers({'Content-Type': 'application/json', 'Token': localStorage.getItem('token')}), 
			method:'GET' })
		resp = await result.json()

		app.renderRides(document.getElementById('rides'), resp.rides )

		app.finished()
	},

	getDriverRides: async() => {
		let route = `${app.api}/admin/rides/driver/${filters.rides.id}/${filters.rides.page}/${filters.rides.limit}`;

		app.loading()

		result = await fetch(route, {
			headers: new Headers({'Content-Type': 'application/json', 'Token': localStorage.getItem('token')}), 
			method:'GET' })
		resp = await result.json()

		app.renderRides(document.getElementById('rides'), resp.rides )

		app.finished()
	},

	getAllRides: async () => {
		let route = `${app.api}/admin/rides/all/${filters.rides.page}/${filters.rides.limit}`;

		app.loading()

		result = await fetch(route, {
			headers: new Headers({'Content-Type': 'application/json', 'Token': localStorage.getItem('token')}), 
			method:'GET' })
		resp = await result.json()

		app.renderRides(document.getElementById('rides'), resp.rides )

		app.finished()
	}, 

	renderRides: (container, rides) => {
		let html = ""
		for(i in rides){
			let ride = rides[i]
			let row = `
				<tr>
					<td>${ride.id}</td>
					<td>${ride.username}</td>
					<td>${ride.amount}</td>
					<td>${ride.date}</td>
					<td>${ride.payment}</td>
					<td>${ride.status}</td>
				</tr>
			`
			html += row
		}

		container.innerHTML = html;
	},

	// drivers

	getDrivers: async ( container, astable = true) => {
		let route = app.api + "/admin/drivers"
		app.loading()

		try{
			result = await fetch(route, {
				headers: new Headers({'Content-Type': 'application/json', 'Token': localStorage.getItem('token')}), 
				method:'GET' })
			resp = await result.json()

			if(resp.status == 200){
				if(astable) app.renderDriversAsTable(container, resp.drivers )
				else app.renderDriversAsDropDown(container, resp.drivers ) 
			}else{
				alert(resp.message)
			}

			app.finished();
		}
		catch(e){
			app.finished()
		}
	},

	renderDriversAsTable: ( container = document.getElementById('driverslist'), drivers ) => {
		let html = "";
		for(i in drivers){
			let driver = drivers[i]
			let row = `
				<tr onclick="app.driverDetails(event, ${driver.id})">
					<td>${driver.id}</td>
					<td>${driver.firstname}</td>
					<td>${driver.lastname}</td>
					<td>${driver.approved}</td>
					<td> 
						<div class="dropdown">
						  <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
						    Actions
						  </button>
						  <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
						    <a class="dropdown-item" href="#" onclick="app.drivers.activate(${driver.id}, '${driver.firstname}')">Activate Driver</a>
						    <a class="dropdown-item" href="#" onclick="app.drivers.deactivate(${driver.id}, '${driver.firstname}')">Deactivate Driver</a>
						    <a class="dropdown-item" href="#" onclick="app.drivers.fundWallet(${driver.id}, '${driver.firstname}')">Fund Driver's Wallet</a>
						    <a class="dropdown-item" href="rides.html?driver=${driver.id}">View Driver's Rides</a>
						  </div>
						</div>
					</td>
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

	renderDriversAsDropDown: ( container, drivers ) => {
		let html = "<select id='selectDriver' class='form-control' onchange='selectedDriver = this.value'>"
		for(i in drivers){
			let driver = drivers[i]
			html += `<option value="${driver.id}">${driver.firstname} ${driver.lastname}</option>`
		}
		html += "</select>"
		container.innerHTML = html
	},

	// schools

	getSchools: async ( container, astable = true ) => {
		let route = app.api + "/admin/schools"
		app.loading()

		try{
			result = await fetch(route, {
				headers: new Headers({'Content-Type': 'application/json', 'Token': localStorage.getItem('token')}), 
				method:'GET' })
			resp = await result.json()

			if(resp.status == 200){
				if(astable) app.renderSchoolsAsTable(container, resp.schools)
				else app.renderSchoolsAsDropDown(container, resp.schools )
			}else{
				alert(resp.message)
			}

			app.finished()
		}
		catch(e){
			app.finished()
		}

	},

	renderSchoolsAsTable: ( container, schools ) => {
		let html = "";
		for(i in schools){
			let school = schools[i]
			let row = `
				<tr onclick="app.schoolDetails(event, ${school.id})">
					<td>${school.id}</td>
					<td>${school.name}</td>
					<td>${school.address}</td>
					<td> 
						<div class="dropdown">
						  <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
						    Actions
						  </button>
						  <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
						    <a class="dropdown-item" href="#" onclick="app.schools.showAddSchoolAdmin(${school.id})">Add School Admin</a>
						  </div>
						</div>
					</td>
				</tr>
			`
			html += row;
		}

		container.innerHTML = html;
	},

	renderSchoolsAsDropDown: ( container, schools ) => {
		let html = "<select id='selectSchool' class='form-control' onchange='selectedSchool = this.value'>"
		for(i in schools){
			let school = schools[i]
			html += `<option value="${school.id}">${school.name}</option>`
		}
		html += "</select>"
		container.innerHTML = html
	},

	renderUsersAsDropDown: ( container, users ) => {
		let html = "<select id='selectUser' class='form-control' onchange='selectedUser = this.value'>"
		for(i in users){
			let user = users[i]
			html += `<option value="${user.id}">${user.firstname}</option>`
		}
		html += "</select>"
		container.innerHTML = html
	},

	drivers: {
		activate: async (id, name) => {
			c = confirm("Are you sure you want to activate Driver " + name)
			if(!c) return;

			app.loading()

			try{
				req = await fetch(app.api + "/admin/driver/activate/" + id, {
				headers: new Headers({'Content-Type': 'application/json', 'Token': localStorage.getItem('token')}), 
				method:'PUT' })
				resp = await req.json()

				if(resp.status == 200){
					alert(resp.message)
					app.getDrivers(document.getElementById('driverslist'))
				}

				app.finished()
			}
			catch(e){
				app.finished()
			}
		},

		deactivate: async (id, name) => {
			c = confirm("Are you sure you want to deactivate Driver " + name)
			if(!c) return;

			app.loading()

			try{
				req = await fetch(app.api + "/admin/driver/deactivate/" + id, {
				headers: new Headers({'Content-Type': 'application/json', 'Token': localStorage.getItem('token')}), 
				method:'PUT' })
				resp = await req.json()

				if(resp.status == 200){
					alert(resp.message)
					app.getDrivers(document.getElementById('driverslist'))
				}

				app.finished()
			}
			catch(e){
				app.finished()
			}
		},

		fundWallet: async (id, name) => {
			let p = prompt("How much would you like to fund " + name + "'s wallet with");
			let amount = Number.parseInt(p);
			if(isNaN(amount)){ return alert("Please enter a valid number"); }

			app.loading()

			req = await fetch(`${app.api}/admin/driver/wallet/${id}/${amount}`, {
				headers: new Headers({'Content-Type': 'application/json', 'Token': localStorage.getItem('token')}), 
				method:'PUT' })
				resp = await req.json()

			app.finished()

			if(resp.status == 200){
				alert("Driver's Wallet Has been funded");
			}
		}
	},

	userDetails: async (event, id) => {
		if(event.target.tagName != 'TD'){ return; }
		app.loading()

		req = await fetch(`${app.api}/admin/details/user/${id}`, {
				headers: new Headers({'Content-Type': 'application/json', 'Token': localStorage.getItem('token')}), 
				method:'GET' })
				resp = await req.json()

		app.finished()

		if(resp.status !== 200){ return; }

		let html = `
				<div class="row">
				  <div class="col-md-6">
				    <div class="card"> 
				      <div class="card-body">
				        <h4 class="card-title">Name: ${resp.user.name}</h4>
				        <h4 class="card-title">Email: ${resp.user.email}</h4>
				        <h4 class="card-title">Wallet Balance: ${resp.user.wallet_balance}</h4>
				        <h4 class="card-title">School: ${resp.user.school}</h4>
				      </div>
				    </div>
				  </div>
				</div>
			
		`;

		let cdiv = document.createElement('div');
		cdiv.className = "custommodal";
		cdiv.addEventListener('click', function(){document.getElementById('user_detail_modal').remove(); }, false);
		cdiv.id = "user_detail_modal";
		cdiv.innerHTML = html;

		document.body.appendChild(cdiv);
	},
	schoolDetails: async (event, id) => {
		if(event.target.tagName != 'TD'){ return; }
		app.loading()

		req = await fetch(`${app.api}/admin/details/school/${id}`, {
				headers: new Headers({'Content-Type': 'application/json', 'Token': localStorage.getItem('token')}), 
				method:'GET' })
				resp = await req.json()

		app.finished()

		if(resp.status !== 200){ return; }

		let html = `
				<div class="row">
				  <div class="col-md-6">
				    <div class="card"> 
				      <div class="card-body">
				        <h4 class="card-title">Name: ${resp.school.name}</h4>
				        <h4 class="card-title">Email: ${resp.school.email}</h4>
				        <h4 class="card-title">Wallet Balance: ${resp.school.wallet_balance}</h4>
				      </div>
				    </div>
				  </div>
				</div>
			
		`;

		let cdiv = document.createElement('div');
		cdiv.className = "custommodal";
		cdiv.addEventListener('click', function(){document.getElementById('user_detail_modal').remove(); }, false);
		cdiv.id = "user_detail_modal";
		cdiv.innerHTML = html;

		document.body.appendChild(cdiv);
	},
	driverDetails: async (event, id) => {
		if(event.target.tagName != 'TD'){ return; }
		app.loading()

		req = await fetch(`${app.api}/admin/details/driver/${id}`, {
				headers: new Headers({'Content-Type': 'application/json', 'Token': localStorage.getItem('token')}), 
				method:'GET' })
				resp = await req.json()

		app.finished()

		if(resp.status !== 200){ return; }

		let html = `
				<div class="row">
				  <div class="col-md-6">
				    <div class="card"> 
				      <div class="card-body">
				        <h4 class="card-title">Name: ${resp.driver.name}</h4>
				        <h4 class="card-title">Email: ${resp.driver.email}</h4>
				        <h4 class="card-title">Wallet Balance: ${resp.driver.wallet_balance}</h4>
				        <h4 class="card-title">School: ${resp.driver.school}</h4>
				      </div>
				    </div>
				  </div>
				</div>
			
		`;

		let cdiv = document.createElement('div');
		cdiv.className = "custommodal";
		cdiv.addEventListener('click', function(){document.getElementById('user_detail_modal').remove(); }, false);
		cdiv.id = "user_detail_modal";
		cdiv.innerHTML = html;

		document.body.appendChild(cdiv);
	},
	schools: {
		showAddSchool: () => {
			document.getElementById("add_school_modal").classList.remove('hidden')
		},
		hideAddSchool: () => {
			document.getElementById("add_school_modal").classList.add('hidden')	
		},
		addSchool: async () => {
			if( document.getElementById('school_password').value != document.getElementById('school_password2').value){
				return alert("Password confirmation does not match");
			}

			app.loading();

			let route = `${app.api}/admin/schools`
			let data = {
				name: document.getElementById('school_name').value,
				address: document.getElementById('school_address').value,
				location: document.getElementById('school_location').value,
				phone: document.getElementById('school_phone').value,
				email: document.getElementById('school_email').value,
				password: document.getElementById('school_password').value
			};

			let result = await fetch(route, {
				headers: new Headers({'Content-Type': 'application/json', 'Token': localStorage.getItem('token')}), 
				method:'POST', body: JSON.stringify(data) })
			resp = await result.json()

			if(resp.status == 200){
				alert("School Added");
				app.schools.hideAddSchool();
			}else{
				alert(resp.message);
			}

			app.finished();



			app.getSchools(document.getElementById('schoollist'))
		},

		addSchoolAdmin: async () => {
			app.loading();

			let route = `${app.api}/admin/school/admin`
			let data = {
				firstname: document.getElementById('first_name').value,
				lastname: document.getElementById('last_name').value,
				email: document.getElementById('email').value,
				password: document.getElementById('password').value,
				school: document.getElementById('school_id').value
			};

			let result = await fetch(route, {
				headers: new Headers({'Content-Type': 'application/json', 'Token': localStorage.getItem('token')}), 
				method:'POST', body: JSON.stringify(data) })
			resp = await result.json()

			if(resp.status == 200){
				alert("School Admin Added");
				app.schools.hideAddSchoolAdmin();
			}else{
				alert(resp.message);
			}

			app.finished();

		},

		hideAddSchoolAdmin: () => {
			document.getElementById('school_id').value = '';
			document.getElementById('add_school_admin').classList.add('hidden')
		},

		showAddSchoolAdmin: (id) => {
			document.getElementById('school_id').value = id;
			document.getElementById('add_school_admin').classList.remove('hidden')
		}
	},
	activateUser: async () => {
		//
	},
	deactivateUser: async () => {
		//
	},
	resetUserPassword: async () => {
		//
	},

	
	addSchoolAdmin: async () => {
		//
	},
	removeSchoolAdmin: async () => {
		//
	},
	browseSchoolAdmin: async () => {
		//
	}

}