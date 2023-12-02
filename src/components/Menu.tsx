import "./Menu.css"
import logo from '../assets/AD_logo.png';

function Menu()
{
  return (
    <div className="menu">
      <img src={logo} alt="LOGO" />
      <div>
        <span style={{ color: '#32394E' }}>Outlier</span>
        <span style={{ color: '#485BFF' }}>X</span>
        <span style={{ color: '#32394E' }}>pert</span>
      </div>

    </div>
  );
};


export default Menu;