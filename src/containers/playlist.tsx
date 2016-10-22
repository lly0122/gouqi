import * as React from 'react'
import {
  ListView,
  ScrollView,
  Text
} from 'react-native'
import { connect, Dispatch } from 'react-redux'
import * as api from '../services/api'
import ListItem from '../components/listitem'
import List from '../components/list'
import { IPlaylistsProps } from '../interfaces'
import * as Actions from '../actions'


interface IProps extends IPlaylistsProps {
  syncPlaylists: {
    (): Redux.Action
  }
}

class PlayList extends React.Component<
  IProps,
  { ds: React.ListViewDataSource }
> {
  constructor (props: IProps) {
    super(props)
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
    this.state = {
      ds: ds.cloneWithRows(props.playlists)
    }
  }

  componentDidMount() {
    this.props.syncPlaylists()
  }

  componentWillReceiveProps(nextProps: IProps) {
    if (nextProps.playlists !== this.props.playlists) {
      this.setState({
        ds: this.state.ds.cloneWithRows(nextProps.playlists)
      })
    }
  }

  renderPlayList = (playlist: api.IPlaylist) => {
    return (
      <ListItem
        title={playlist.name}
        picURI={playlist.coverImgUrl}
        subTitle={playlist.subscribedCount + ' 人订阅'}
        key={playlist.id}
      />
    )
  }

  onEndReached = () => {
    console.log('is loading')
    console.log(this.props.isLoading)
    if (!this.props.isLoading) {
      this.props.syncPlaylists()
    }
  }

  renderFooter () {
    return this.props.isLoading ?
      <Text>载入中...</Text> :
      null
  }

  render() {
    return (
      <ListView
        showsVerticalScrollIndicator
        enableEmptySections
        dataSource={this.state.ds}
        initialListSize={15}
        pagingEnabled={false}
        removeClippedSubviews={true}
        onEndReached={this.onEndReached}
        // onEndReachedThreshold={30}
        scrollRenderAheadDistance={90}
        renderRow={this.renderPlayList}
        renderFooter={this.renderFooter.bind(this)}
      />
    )
  }
}

export default connect(
  ({ playlist: {
    isLoading, playlists, offset, more
  } }: { playlist: IPlaylistsProps }) => ({
    isLoading, playlists, offset, more
  }),
  (dispatch: Dispatch<Redux.Action>) => ({
    syncPlaylists() {
      return dispatch(Actions.syncPlaylists())
    }
  })
)(PlayList)

