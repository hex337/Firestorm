import React, {Component} from 'react';
import './App.css';
import _ from 'lodash';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      discoveries: [],
      groups: []
    }
    this.poll = this.poll.bind(this);
    this.handleGroupClick = this.handleGroupClick.bind(this);
  }

  async poll() {
    let res = await fetch('./discover')
    try {
      let discoveries = await res.json();

      let groupByName = {};
      _.each(discoveries, d => {
        _.each(d.programList, p => {
          let pb = {
            id: d.id,
            name: d.name || 'Pixelblaze_' + d.id
          };
          if (groupByName[p.name]) {
            groupByName[p.name].push(pb);
          } else {
            groupByName[p.name] = [pb];
          }
        })
      })
      let groups = _.chain(groupByName)
          .map((v, k) => ({name: k, pixelblazes: v}))
          .sortBy('name')
          .value();
      console.log(groups);

      this.setState({discoveries, groups})
    } catch (err) {
      this.setState({err})
    }
    if (!this.unmounting)
      this.interval = setTimeout(this.poll, 1000)
  }

  componentDidMount() {
    this.poll();
  }

  componentWillUnmount() {
    this.unmounting = true;
    clearInterval(this.interval);
  }

  async handleGroupClick(event, group) {
    event.preventDefault();
    console.log(group);
    const res = await fetch('./command', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        command: {
          programName: group.name
        },
        ids: _.map(group.pixelblazes, 'id')
      })
    });
  }

  render() {
    return (
        <div className="container">
          <header className="header clearfix">
            <nav>
              <ul className="nav nav-pills float-right">
                <li className="nav-item">
                  <a className="nav-link" href="https://www.bhencke.com/pixelblaze">About Pixelblaze</a>
                </li>
              </ul>
            </nav>
            <h3 className="text-muted">Pixelblaze Firestorm</h3>
          </header>

          <main role="main">
            <hr/>

            <div className="row">
              <div className="col-lg-12">
                <h3>Controllers</h3>
                <ul className="list-group col-lg-8" id="list">
                  {this.state.discoveries.map(d =>
                      <li className="list-group-item">
                        <a className="btn btn-primary float-right" href={"http://" + d.address} target="_blank">Open</a>
                        <h5>{d.name || "Pixelblaze_" + d.id} v{d.ver} @ {d.address}</h5>
                      </li>
                  )}
                </ul>
              </div>
            </div>
            <hr/>

            <h3>Patterns</h3>
            <div className="list-group">
              {this.state.groups.map(g =>
                  <a key={g.name} href="#" className="list-group-item" onClick={(e) => this.handleGroupClick(e, g)}>
                    <h5>{g.name}</h5>
                    <em>
                      <small>{_.map(g.pixelblazes, 'name').join(', ')}</small>
                    </em>
                  </a>
              )}
            </div>

          </main>

          <footer className="footer">
            <p>&copy; Ben Hencke 2018</p>
          </footer>

        </div>
    );
  }
}

export default App;
