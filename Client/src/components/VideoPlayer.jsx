import React, { useContext } from 'react'
import { Grid, Typography, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import { SocketContext } from '../SocketContext';

const useStyles = makeStyles((theme) => ({
    video: {
        width: '450px',
        [theme.breakpoints.down('xs')]: {
            width: '300px',
        },
    },
    gridContainer: {
        justifyContent: 'center',
        [theme.breakpoints.down('xs')]: {
            flexDirection: 'column',
        },
    },
    paper: {
        padding: '10px',
        border: '2px solid black',
        margin: '10px',
    },
}));
const VideoPlayer = () => {
    const classes = useStyles();
    const { name, callAccepted, myVideo, userVideo, callEnded, stream, call } = useContext(SocketContext);
    return (
        <Grid container className={classes.gridContainer} >
            {/* {Our's Video} */}
            {
                stream && (
                    <Paper className={classes.paper}>
                        <Grid item xs={12} md={6}>
                            <Typography variant='h5' gutterBottom>{name || 'Name'}</Typography>
                            <video playsInline muted autoPlay className={classes.video} ref={myVideo} />
                        </Grid>
                    </Paper>
                )
            }
            {/* {User's Video} */}
            {
                callAccepted && !callEnded && (
                    <Paper className={classes.paper}>
                        <Grid item xs={12} md={6}>
                            <Typography variant='h5' gutterBottom>{call.name || 'Name'}</Typography>
                            <video playsInline autoPlay className={classes.video} ref={userVideo} />
                        </Grid>
                    </Paper>
                )
            }
        </Grid>
    )
}

export default VideoPlayer