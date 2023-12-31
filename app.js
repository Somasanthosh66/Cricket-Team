const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDBObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
//Get Players API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT * FROM cricket_team;`;

  const cricketArray = await db.all(getPlayersQuery);
  response.send(
    cricketArray.map((eachPlayer) =>
      convertDBObjectToResponseObject(eachPlayer)
    )
  );
});
//Create New Player Team

app.post("/players/", async (request, response) => {
  const cricketDetails = request.body;
  //console.log(cricketDetails);
  const { playerName, jerseyNumber, role } = cricketDetails;
  const addPlayerDetail = `
  INSERT INTO 
  cricket_team (player_name, jersey_number, role)
  VALUES 
  (
    
      '${playerName}',
      ${jerseyNumber},
      '${role}'
  );
  `;
  const dbResponse = await db.run(addPlayerDetail);
  //console.log(dbResponse);
  //const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//Returns a Player based on a Details
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
        SELECT * FROM cricket_team 
        WHERE 
        player_id = ${playerId};
    `;
  const player = await db.get(getPlayerQuery);
  response.send(convertDBObjectToResponseObject(player));
});

//Updates the details of a player in the team (database) based on the player ID
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerDetails = `
        UPDATE cricket_team 
        SET 
            player_name= '${playerName}',
            jersey_number= ${jerseyNumber},
            role= '${role}'
        WHERE   
        player_id = ${playerId};`;
  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

//Delete a player from the team (database) based on the player ID

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerDetail = `
    DELETE FROM cricket_team
    WHERE 
    player_id = ${playerId};
    `;
  await db.run(deletePlayerDetail);
  response.send("Player Removed");
});

module.exports = app;