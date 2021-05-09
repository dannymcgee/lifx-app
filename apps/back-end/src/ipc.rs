use std::{net::SocketAddr, time::{Duration, Instant}};

use lifx::PowerLevel;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Message {
	pub channel: Channel,
	pub payload: Option<Payload>,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum Channel {
	Discovery,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum Payload {
	Discovery(Vec<Bulb>)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Bulb {
	pub id: u64,
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
			id: other.target,
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

#[derive(Debug, Serialize, Deserialize)]
pub struct HSBK {
	pub hue: f32,
	pub saturation: f32,
	pub brightness: f32,
	pub kelvin: u16,
}

impl From<lifx::HSBK> for HSBK {
	fn from(other: lifx::HSBK) -> Self {
		Self {
			hue: (other.hue as f32 / 65535.0) * 360.0,
			saturation: other.saturation as f32 / 65535.0,
			brightness: other.brightness as f32 / 65535.0,
			kelvin: other.kelvin,
		}
	}
}
