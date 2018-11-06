//localStorage.setItem('token', '5a1365473e1490c4a1f40054f9e1b360610a06ff2bbe2dd017412335f490dabe');

const filters = {
	users: {page:1, limit: 20},
	drivers: { page:1, limit: 20 }
};

const app = {
	api: "https://themoovapp.com/api/v2",

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
				$('#schoolname').text(resp.name);
			}else{
				alert(resp.message);
			}

		app.finished();
	}
}