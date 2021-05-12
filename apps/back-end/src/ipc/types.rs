use std::{
	collections::HashMap,
	net::SocketAddr,
	time::{Duration, Instant},
};
use lifx::PowerLevel;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Request {
	pub channel: Channel,
	pub payload: Option<RequestPayload>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Response {
	pub channel: Channel,
	pub payload: ResponsePayload,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum Channel {
	Discovery,
	GetColor,
	SetColor,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum RequestPayload {
	GetColor { id: u64 },
	SetColor(HashMap<u64, HSBK>),
}

#[derive(Debug, Serialize, Deserialize)]
pub enum ResponsePayload {
	Discovery(Vec<Bulb>),
	GetColor {
		id: String,
		color: HSBK,
	},
	SetColor(Vec<String>),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Bulb {
	pub id: String,
	pub addr: SocketAddr,
	pub last_seen: Duration,
	pub model: Option<(u32, u32)>,
	pub location: Option<String>,
	pub group: Option<String>,
	pub name: Option<String>,
	pub power_level: Option<bool>,
	pub color: Color,
}

impl From<&lifx::udp::Bulb> for Bulb {
	fn from(other: &lifx::udp::Bulb) -> Self {
		Bulb {
			id: format!("{:#018x}", other.target),
			addr: other.addr,
			last_seen: Instant::now() - other.last_seen,
			model: other.model.data,
			location: other.location.data.clone(),
			group: other.group.data.clone(),
			name: other.name.data.clone(),
			power_level: match other.power_level.data {
				Some(PowerLevel::Standby) => Some(false),
				Some(PowerLevel::Enabled) => Some(true),
				None => None,
			},
			color: other.color.clone().into(),
		}
	}
}

#[derive(Debug, Serialize, Deserialize)]
pub enum Color {
	Unknown,
	Single(Option<HSBK>),
	Multi(Option<Vec<Option<HSBK>>>),
}

impl From<lifx::udp::Color> for Color {
	fn from(other: lifx::udp::Color) -> Self {
		use lifx::udp::Color::*;

		match other {
			Unknown => Self::Unknown,
			Single(x) => match x.data {
				Some(x) => Self::Single(Some(x.into())),
				None => Self::Single(None),
			},
			Multi(x) => match x.data {
				Some(x) => Self::Multi(Some(
					x.iter()
						.map(|it| it.map(|x| x.into()))
						.collect()
				)),
				None => Self::Multi(None),
			}
		}
	}
}

#[derive(Debug, Copy, Clone, Serialize, Deserialize)]
pub struct HSBK {
	pub hue: u16,
	pub saturation: u16,
	pub brightness: u16,
	pub kelvin: u16,
}

impl From<&lifx::HSBK> for HSBK {
	fn from(other: &lifx::HSBK) -> Self {
		Self {
			hue: other.hue,
			saturation: other.saturation,
			brightness: other.brightness,
			kelvin: other.kelvin,
		}
	}
}

impl From<lifx::HSBK> for HSBK {
	fn from(other: lifx::HSBK) -> Self {
		Self {
			hue: other.hue,
			saturation: other.saturation,
			brightness: other.brightness,
			kelvin: other.kelvin,
		}
	}
}

impl From<HSBK> for lifx::HSBK {
	fn from(other: HSBK) -> Self {
		Self {
			hue: other.hue,
			saturation: other.saturation,
			brightness: other.brightness,
			kelvin: other.kelvin,
		}
	}
}
