import { Player } from '../models/Player.js';
import { Schedule } from '../models/Schedule.js';
import { PlayerSchedules } from '../models/PlayerSchedules.js';
import bcrypt from 'bcrypt';

const saltRounds = 10;

export const getPlayers = async (req, res) => {
  try {
    const players = await Player.findAll({
      where: {
        isActive: true,
      },
      attributes: {
        exclude: ['isActive'],
      },
    });
    
    res.json({
      data: players,
    });

  } catch (error) {
    console.log(error);
  }
};

// export const getPlayers = async (req, res) => {
//   // en el json, no mostrar el campo isActive
//   try {
//     const players = await Player.findAll({
//       attributes: {
//         exclude: ['isActive'],
//       },
//     });
//     res.json({
//       data: players,
//     });
//   }
//   catch (error) {
//     console.log(error);
//   }
// };

export const getPlayersWithSchedules = async (req, res) => {
  try {
    const players = await Player.findAll({
      include: {
        model: Schedule,
      },
    });
    res.json({
      data: players,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getPlayerById = async (req, res) => {
  const { id } = req.params;
  try {
    const player = await Player.findOne({
      where: {
        id,
      },
      include: {
        model: Schedule,
      },
    });
    res.json({
      data: player,
    });
  } catch (error) {
    console.log(error);
  }
};

export const createPlayer = async (req, res) => {

  const { email, name, password, phone, apodo } = req.body;
  const player = await Player.findOne({
    where: {
      email,
    },
  });
  
  if (player) {
    return res.status(400).json({
      message: 'Ya existe un jugador con ese email',
      data: {},
    });
   
  } else {
    try {
      const newPlayer = await Player.create({
        email,
        name,
        password: await bcrypt.hash(password, saltRounds),
        phone,
        apodo,
      });
      if (newPlayer) {
        return res.status(201).json({
          message: 'Jugador creado correctamente',
          data: newPlayer,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Algo salió mal',
        data: {},
      });
    }
  }
}

export const loginPlayer = async (email, password) => {

  const player = await Player.findOne({
    where: {
      email,
      password
    },
  });

  if (player) {
    return player;
  }

  
  return null;
  
};


// export const loginPlayer = async (email, password) => {
  
//   const player = Player.findOne({
//     where: {
//       email,
//     },
//   });

//   if (!player) return null;

//   if (player.password !== password) return null;

//   return player;
  
// };



export const assignSchedule = async (req, res) => {
  const { id } = req.params;
  const { scheduleId, payer } = req.body;

  try {
    const player = await Player.findOne({
      where: {
        id,
      },
    });

    const schedule = await Schedule.findOne({
      where: {
        id: scheduleId,
      },
    });

    const payerSchedule = await PlayerSchedules.findOne({
      where: {
        scheduleId,
        payer: true,
      },
    });

    if (payerSchedule && payer) {
      return res.status(400).json({
        message: 'There is already a payer for this schedule',
      });
    }

    const playerSchedule = await Player.findOne({
      where: {
        id,
      },
      include: {
        model: Schedule,
        where: {
          id: scheduleId,
        },
      },
    });

    if (playerSchedule) {
      return res.status(400).json({
        message: 'Player already has this schedule',
      });
    }

    if (player && schedule) {
      player.addSchedule(schedule, { through: { payer } });
      return res.status(201).json({
        message: 'Schedule assigned to player',
        data: player,
      });
    }

    return res.status(404).json({
      message: 'Player or schedule not found',
      data: {},
    });
  
  } catch (error) {
    console.log(error);
  }
}

export const deletePlayer = async (req, res) => {

  const { id } = req.params;

  try {
    const player = await Player.findOne({
      where: {
        id,
      },
    });

    if (player) {
      player.isActive = false;
      player.save();
      await PlayerSchedules.destroy({
        where: {
          playerId: id,
        },
      });
    }

    return res.status(404).json({
      message: 'Player not found',
      data: {},
    });
  } catch (error) {
    console.log(error);
  }
}
