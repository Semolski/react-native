import React, { Component, useRef } from 'react';
import { View, Text, ScrollView, SafeAreaView, FlatList, StyleSheet, Modal, Button, Alert, PanResponder, Share } from 'react-native';
import {Card,Icon, Input, Rating} from "react-native-elements";
import {connect} from "react-redux";
import {baseUrl} from "../shared/baseUrl";
import {postFavorite, postComment, addComment} from "../redux/ActionCreators";
import * as Animatable from 'react-native-animatable';

const mapStateToProps = state => {
    return {
        dishes: state.dishes,
        comments: state.comments,
        favorites: state.favorites
    }
}

const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment: (dishId, author, rating, comment) => dispatch(postComment(dishId, rating, author, comment))
});

function RenderDish(props) {
    const dish = props.dish;

    const viewRef = useRef(null);

    const recognizeDrag = ({moveX, moveY, dy, dx}) => {
        return dx < -200;
    };

    const recognizeDragComment = ({dx}) => {
        return dx > 200;
    }

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            return true;
        },
        onPanResponderGrant: () => {
          viewRef.current.rubberBand(1000)
              .then(endState => console.log(endState.finished ? 'finished' : 'cancelled'));
        },
        onPanResponderEnd: (e, gestureState) => {
            if (recognizeDrag(gestureState))
                Alert.alert(
                    'Add to Favorites?',
                    'Are you sure you wish to add ' + dish.name + 'to your favorites?',
                    [
                        {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel pressed'),
                        style: 'cancel'
                        },
                        {
                            text: 'OK',
                            onPress: () => props.favorite ? console.log('Already favorite') : props.onPress()
                        }
                    ],
                    { cancelable: false }
                    )
                if (recognizeDragComment(gestureState)) {
                    props.onSelect()
                }

                return true;
            }
        });

    const shareDish = (title, message, url) => {
        Share.share({
            title: title,
            message: title + ': ' + message + ' ' + url,
            url: url
        }, {
            dialogTitle: 'Share ' + title
        });
    }


    if (dish != null) {
        return(

            <Animatable.View animation="fadeInDown" duration={2000} delay={1000}
                             {...panResponder.panHandlers}
                                ref={viewRef}>
                <Card
                    featuredTitle={dish.name}
                    image={{uri: baseUrl + dish.image}}>
                    <Text style={{margin: 10}}>
                        {dish.description}
                    </Text>
                    <View style={styles.cardRow}>
                        <Icon
                            raised
                            reverse
                            name={props.favorite ? 'heart' : 'heart-o'}
                            type='font-awesome'
                            color='#f50'
                            onPress={() => props.favorite ? console.log('Already favorite') : props.onPress()}
                        />
                        <Icon
                            raised
                            reverse
                            name={'pencil'}
                            type='font-awesome'
                            color='#512DA8'
                            style={styles.cardItem}
                            onPress={() => openCommentForm}
                        />
                        <Icon
                            raised
                            reverse
                            name='share'
                            type='font-awesome'
                            color='#51D2A8'
                            style={styles.cardItem}
                            onPress={() => shareDish(dish.name, dish,description, baseUrl + dish.image)}
                        />
                    </View>
                </Card>
            </Animatable.View>
        );
    }
    else {
        return(<View/>)
    }
}

function RenderComments(props){
    const comments = props.comments;

    const renderCommentItem = ({item, index}) => {
        return(
          <View key={index} style={{margin:10}}>
              <Text style={{fontSize: 14}}>{item.comment}</Text>
              <Text style={{fontSize: 12}}>{item.rating} Stars</Text>
              <Text style={{fontSize: 12}}>{'-- ' + item.author + ', ' + item.date}</Text>
          </View>
        );
    }

    if (comments != null) {
        return(
            <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
                <Card title="Comments">
                    <FlatList
                        data={comments}
                        renderItem={renderCommentItem}
                        keyExtractor={item => item.id.toString()}
                    />
                </Card>
            </Animatable.View>
        );
    }
    else {
        return(<View/>)
    }
}

class Dishdetail extends Component {

    constructor(props) {
        super(props);
        this.state = this.defaultState();
    }

    defaultState(){
        return({
            rating: 3,
            author: '',
            comment: '',
            showCommentForm: false
        })
    }

    static navigationOptions = {
        title: 'Dish Details'
    };


    openCommentForm(){
        this.setState({showCommentForm: true})
    }
    setAuthor(author) {
        this.setState({author})
    }
    markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }
    setRating(rating) {
        this.setState({rating})
    }
    resetCommentForm(){
        this.setState(this.defaultState());
    }
    setComment(comment) {
        this.setState({comment})
    }
    handleComment(dishId){
        this.props.postComment(dishId, this.state.rating, this.state.author, this.state.comment);
        this.resetCommentForm();
    }



    render() {
        const dishId = this.props.navigation.getParam('dishId','');

        return(
            <ScrollView>
                <RenderDish
                    dish={this.props.dishes.dishes[+dishId]}
                    openCommentForm={() => this.openCommentForm()}
                    favorite={this.props.favorites.some(el => el === dishId)}
                    markFavorite={() => this.markFavorite(dishId)}
                />
                <Modal
                    animationType={'slide'}
                    transparent={false}
                    visible={this.state.showCommentForm}
                    onDismiss={() => {this.resetCommentForm()}}
                    onRequestClose={() => {this.resetCommentForm()}}
                >
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>Add Comment</Text>
                        <Rating
                            minValue={1}
                            startingValue={3}
                            fractions={0}
                            showRating={true}
                            onFinishRating={(rating) => this.setRating(rating)}
                        />
                        <Input
                            placeholder="Author"
                            leftIcon={
                                <Icon
                                    name='user'
                                    type='font-awesome'
                                />
                            }
                            onChangeText={(author) => this.setAuthor(author)}
                        />
                        <Input
                            placeholder="Comment"
                            leftIcon={
                                <Icon
                                    name='comment'
                                    type='font-awesome'
                                />
                            }
                            onChangeText={(comment) => this.setComment(comment)}
                        />
                        <Button
                            onPress={() => {this.handleComment(dishId)}}
                            color='#512DA8'
                            title='SUBMIT'
                        />
                        <Button
                            onPress={() => {this.resetCommentForm()}}
                            color='#6c757d'
                            title='CANCEL'
                        />
                    </View>
                </Modal>
                <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)}/>
            </ScrollView>
            );
    }
}

const styles = StyleSheet.create({

    modalTitle: {
        fontSize: 24,
        backgroundColor: '#512DA8',
        textAlign: 'center',
        color:  'white',
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modal: {
        margin: 20,
        justifyContent: 'center',
    },
    modalText: {
        fontSize: 18,
        margin: 10,
    },
    formItem: {
        flex: 1,
    },
    formRow: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        margin: 20,
    },
    formLabel: {
        fontSize: 18,
        flex: 2,
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);