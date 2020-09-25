import React, {Component} from 'react';
import {Text, View, ScrollView, StyleSheet, SafeAreaView, Alert, Picker, Switch, Button, Modal} from 'react-native';
import { Card } from 'react-native-elements';
import DatePicker from "react-native-datepicker";
import {Permissions, Notifications} from "expo/build/removed.web";
import * as Animatable from 'react-native-animatable';
import * as Calendar from 'expo-calender';

class Reservation extends Component {

    constructor(props) {
        super(props);
        this.state = this.defaultState();
    }

    defaultState() {
        return({
            guests: 1,
            smoking: false,
            date: ''
        })
    }

    static navigationOptions = {
        title: 'Reserve Table'
    }

    resetForm() {
        this.setState(this.defaultState());
    };

    resConfirm() {
        this.resetForm();
    }

    handleReservation() {
        console.log(JSON.stringify(this.state));
        const smokeSec = this.state.smoking ? 'Yes' : 'No'

        let message = 'Number of Guests: ' + this.state.guests +
            '\nSmoking? ' + smokeSec +
                '\nDate and Time ' + this.state.date

        Alert.alert(
            'Your Reservation OK?',
            'Number of Guests: ' + this.state.guests + '\n' +
            'Smoking? ' + this.state.smoking + '\n' +
            'Date and Time: ' + this.state.date,
            [
                {
                    text: 'Cancel',
                    onPress: () => {
                        console.log('Reservation Cancelled');
                        this.resetForm();
                    },
                    style: 'cancel'
                },
                {
                    text: 'OK', onPress: () => {
                    this.presentLocalNotification(this.state.date);
                    this.addReservationToCalendar(this.state.date);
                    this.resetForm();
                },
              }
            ],
            { cancelable: false }
        );

    }

    async obtainCalenderPermission() {
        let permission = await Permissions.getAysnc(Permissions.CALENDAR)
        if (permission.status !== 'granted') {
            permission = await Permissions.askAsync(Permissions.CALENDAR)
            if (permission.status !== 'granted') {
                Alert.alert('Permission not granted to use calendar')
            }
        }
        return permission;
    }

    async getCalendarId() {
        const calendars = await Calendar.getCalendarAsync();
        const defaultCalendars = calendars.filter(each => each.source.name === 'Default');
        return defaultCalendars[0].id;
    }

    async addReservationToCalendar(date) {
        await this.obtainCalenderPermission();

        console.log("Date: " + date);

        const calendar = await Calendar.getCalendarAsync();
        console.log({ calendar });

        const defaultCalendarId = await this.getCalendarId();

        console.log("Calendar Id: " + defaultCalendarId);

        Calendar.createEventAsync(defaultCalendarId, {
            title: 'Con Fusion Table Reservation',
            startDate: new Date(Date.parse(date)),
            endDate: new Date(Date.parse(date) + (2*60*60*1000)),
            timeZone: 'Asia/Hong_Kong',
            location: '121, Clear Water Bay Road, Clear Water Bay, Kowloon, Hong Kong'
        });
    }

    async obtainNotificationPermission() {
        let permission = await Permissions.getAysnc(Permissions.USER_FACING_NOTIFICATIONS)
        if (permission.status !== 'granted'){
            permission = await Permissions.askAsync(Permissions.USER_FACING_NOTIFICATIONS)
            if (permission.status !== 'granted') {
                Alert.alert('Permission not granted to show the notification')
            }
        }
        return permission;
    }

    async presentLocalNotification(date) {
        await this.obtainNotificationPermission()
        Notifications.presentLocalNotificationAsync({
            title: 'Your Reservation',
            body: 'Reservation for' + date + 'requested',
            ios: {
                sound: true
            },
            android: {
                sound: true,
                vibrate: true,
                color: '#512DA8'
            }
        })
    }



    render() {
        let todayDate = new Date().toISOString().split('T')[0];
        return(
          <ScrollView>
              <Animatable.View animation="zoomIn" duration={2000}>
              <View style={styles.formRow}>
                  <Text style={styles.formLabel}>Number of Guests</Text>
                  <Picker
                      style={styles.formItem}
                      selectedValue={this.state.guests}
                      onValueChange={(itemValue, itemIndex) => this.setState({guests: itemValue})}
                  >
                      <Picker.Item label='1' value='1'/>
                      <Picker.Item label='2' value='2'/>
                      <Picker.Item label='3' value='3'/>
                      <Picker.Item label='4' value='4'/>
                      <Picker.Item label='5' value='5'/>
                      <Picker.Item label='6' value='6'/>
                  </Picker>
              </View>
              <View style={styles.formRow}>
                  <Text style={styles.formLabel}>Smoking/Non-Smoking?</Text>
                  <Switch
                      style={styles.formItem}
                      value={this.state.smoking}
                      onTintColor='#512DA8'
                      onValueChange={(value) => this.setState( {smoking: value})}
                  >
                  </Switch>
              </View>
              <View style={styles.formRow}>
                  <Text style={styles.formLabel}>Date and Time</Text>
                  <DatePicker
                      style={{flex: 2, marginRight: 20}}
                      date={this.state.date}
                      format=''
                      mode='datetime'
                      placeholder='select date and time'
                      minDate='2020-01-01'
                      confirmBtnText='Confirm'
                      cancelBtnText='Cancel'
                      customStyles={{
                          dateIcon: {
                              position: 'absolute',
                              left: 0,
                              top: 4,
                              marginLeft: 0
                          },
                          dateInput: {
                              marginLeft: 36
                          }
                      }}
                      onDateChange={(date) => {this.setState({date: date})}}
                  />
              </View>
              <View style={styles.formRow}>
                  <Button
                    title='Reserve'
                    color='#512DA8'
                    onPress={() => this.handleReservation()}
                    accessibilityLabel='Learn more about this purple button'
                  />
              </View>
              {/*<Modal*/}
              {/*        animationType={'slide'}*/}
              {/*        transparent={false}*/}
              {/*        visible={this.state.showModal}*/}
              {/*        onDismiss={() => {this.resetForm()}}*/}
              {/*        onRequestClose={() => {this.resetForm()}}*/}
              {/*      >*/}
              {/*        <View style={styles.modal}>*/}
              {/*            <Text style={styles.modalTitle}>Your Reservation</Text>*/}
              {/*            <Text style={styles.modalText}>Number of Guests: {this.state.guests}</Text>*/}
              {/*            <Text style={styles.modalText}>Smoking? : {this.state.smoking ? 'Yes' : 'No'}</Text>*/}
              {/*            <Text style={styles.modalText}>Date and Time: {this.state.date}</Text>*/}
              {/*            <Button*/}
              {/*                onPress={() => {this.resetForm()}}*/}
              {/*                color='#512DA8'*/}
              {/*                title='Close'*/}
              {/*                    />*/}
              {/*        </View>*/}
              {/*    </Modal>*/}
              </Animatable.View>
          </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    formRow: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        flexDirection: 'row',
        margin: 20
    },
    formLabel: {
        fontSize: 18,
        flex: 2
    },
    formItem: {
        flex: 1
    }
})

export default  Reservation;