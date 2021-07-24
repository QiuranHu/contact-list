import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { fetchContacts } from "../utils/api";
import ContactThumbnail from "../components/ContactThumbnail";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "../utils/colors";
import store from "../store";

const keyExtractor = ({ phone }) => phone;

export default class Favorites extends React.Component {
  static navigationOptions = ({ navigation: { navigate } }) => ({
    title: "Favorites",
    headerLeft: (
      <MaterialIcons
        name="menu"
        size={24}
        style={{ color: colors.black, marginLeft: 10 }}
        onPress={() => navigate("DrawerToggle")}
      />
    ),
  });

  state = {
    contacts: store.getState().contacts,
    loading: store.getState().isFetchingContacts,
    error: store.getState().errors,
  };

  async componentDidMount() {
    const { contacts } = this.state;
    this.unsubscribe = store.onChange(() =>
      this.setState({
        contacts: store.getState().contacts,
        loading: store.getState().isFetchingContacts,
        error: store.getState().error,
      })
    );
    if (contacts.length === 0) {
      const fetchedContacts = await fetchContacts();
      store.setState({
        contacts: fetchedContacts,
        isFetchingContacts: false,
      });
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  renderFavoriteThumbnail = ({ item }) => {
    const {
      navigation: { navigate },
    } = this.props;
    const { avatar } = item;
    return (
      <ContactThumbnail
        avatar={avatar}
        onPress={() => navigate("Profile", { contact: item })}
      />
    );
  };

  render() {
    const { loading, contacts, error } = this.state;
    const favorites = contacts.filter((contact) => contact.favorite);
    return (
      <View style={styles.container}>
        {loading && <ActivityIndicator size="large" />}
        {error && <Text>Error...</Text>}
        {!loading && !error && (
          <FlatList
            data={favorites}
            keyExtractor={keyExtractor}
            numColumns={3}
            contactContainerStyle={styles.list}
            renderItem={this.renderFavoriteThumbnail}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  list: {
    alignItems: "center",
  },
});
