let Parser = (function () {
    let aryPlayerInfos = [];
    let intMaxPlayers = -1;
    let intPlayerCountHistory = [];
    let objDemo = null;

    let _Init = function () {
        DragAndDrop.Init(FileLoading, FileLoaded);
    };

    let FileLoading = (file) => {
        document.querySelector("#table-with-info").style.display = "none";
        document.querySelector("#dragNdrop").style.display = "none";
        document.querySelector("#loader").style.display = "";
        document.querySelector("#table-with-info > .table > tbody").innerHTML = "";
        console.log(file);
    };

    let FileLoaded = (buffer) => {
        aryPlayerInfos.length = 0;
        intMaxPlayers = -1;
        intPlayerCountHistory.length = 0;
        if (objDemo) {
            objDemo.cancel();
        }
        objDemo = new demofile.DemoFile();
        objDemo.gameEvents.on("server_spawn", eventServerSpawn);
        objDemo.gameEvents.on("round_start", eventRoundStart);
        objDemo.parse(buffer);
    };

    let eventServerSpawn = (ev) => {
        intMaxPlayers = ev.maxplayers;
    };

    let eventRoundStart = (ev) => {
        if (objDemo.header.networkProtocol < 13748) {
            objDemo.cancel();
            alert("Error! The demo was not parsed because the demo is very old!\n\nSorry about that.");

            document.querySelector("#table-with-info").style.display = "none";
            document.querySelector("#dragNdrop").style.display = "";
            document.querySelector("#loader").style.display = "none";
            document.querySelector("#table-with-info > .table > tbody").innerHTML = "";
            return;
        }
        let playersThisRound = objDemo.players.filter(p => !p.isFakePlayer && !p.isHltv);
        intPlayerCountHistory.push(playersThisRound.length);
        objDemo.players.forEach((player) => {
            if (player.isFakePlayer || player.isHltv) {
                return;
            }
            if (aryPlayerInfos.find(p => p.steam64Id === player.steam64Id)) {
                return;
            }
            aryPlayerInfos.push(player);
        });
        if (intMaxPlayers >= 0) {
            if (aryPlayerInfos.length >= intMaxPlayers) {
                objDemo.cancel();
            }
        } else {
            if (intPlayerCountHistory.length >= 3) {
                intPlayerCountHistory.splice(0, intPlayerCountHistory.length - 3);

                let totalPlayersHistory = intPlayerCountHistory.reduce((a, b) => a + b, 0);
                if ((totalPlayersHistory / intPlayerCountHistory.length) === playersThisRound.length) {
                    objDemo.cancel();
                }
            }
        }
        updPlayerInfo();
    };

	let updPlayerInfo = () => {
		for (let player of aryPlayerInfos) {
			if (player.added) {
				continue;
			}
			player.added = true;
			let tr = $("<tr></tr>");
			let name = $("<td></td>");
			name.append("<a href=\"https://steamcommunity.com/profiles/" + player.steam64Id + "\" target=\"_blank\">" + player.name + "</a>");
			let crossCode = $("<td></td>");
			crossCode.text(player.resourceProp("m_szCrosshairCodes"));
			crossCode.attr("data-content", "Copied!");
            crossCode.attr("id", "copy");
			crossCode.on("click", CopyCrosshairCode);
			tr.append(name).append(crossCode);
			$("#table-with-info > .table > tbody").append(tr);
		}
		let children = $("#table-with-info > .table > tbody").children().length;
		if (children > 0) {
			$("#table-with-info").css("display", "");
			$("#loader").css("display", "none");
		}
	};
	let CopyCrosshairCode = async (ev) => {
		let access = await navigator.permissions.query({
			name: "clipboard-write"
		});

		if (access.state === "denied") {
			alert("Cannot copy crosshair code due to browser restrictions.");
            console.log("Cannot copy crosshair code due to browser restrictions.");
			return;
		}

		let element = $(ev.target);
		let crossCode = element.text();
		await navigator.clipboard.writeText(crossCode);
		element.popover("show");
		setTimeout(() => element.popover("hide"), 1000);
	};
	return {
		Init: _Init
	};
})();

(function () {
	$(window).ready(Parser.Init);
})();