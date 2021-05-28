use std::time::Duration;
use serde_json::Value;

use crate::ipc::{Channel, HSBK, PowerLevel, Request, RequestPayload};

pub fn parse(input: &str) -> Request {
	let req: Value = serde_json::from_str(input).unwrap();

	let channel = match &req["channel"] {
		Value::String(ch) if ch == "Discovery"     => Channel::Discovery,
		Value::String(ch) if ch == "GetColor"      => Channel::GetColor,
		Value::String(ch) if ch == "SetColor"      => Channel::SetColor,
		Value::String(ch) if ch == "SetPowerLevel" => Channel::SetPowerLevel,
		other => panic!("Expected channel, received {:?}", other),
	};

	let p = req.get("payload");
	let payload = match channel {
		Channel::Discovery      => parse_discovery_payload(p),
		Channel::GetColor       => parse_get_color_payload(p),
		Channel::SetColor       => parse_set_color_payload(p),
		Channel::SetPowerLevel  => parse_set_power_level_payload(p),
	};

	Request { channel, payload }
}

fn parse_discovery_payload(value: Option<&Value>) -> Option<RequestPayload> {
	match &value {
		Some(Value::Null) | None => None,
		other => panic!("Received unexpected payload for Discovery request: {:?}", other),
	}
}

fn parse_get_color_payload(value: Option<&Value>) -> Option<RequestPayload> {
	use Value::Object;
	let payload = if let Some(Object(obj)) = value { obj } else { panic!() };
	let id = parse_id(payload.get("id"));

	Some(RequestPayload::GetColor { id })
}

fn parse_set_color_payload(value: Option<&Value>) -> Option<RequestPayload> {
	use Value::{Object, String};
	let (values, duration) = if let Some(Object(obj)) = value {
		let values = match obj.get("values") {
			Some(Object(map)) => map,
			other => panic!("Expected SetColor.values object, received {:?}", other),
		};
		let duration = parse_duration(obj.get("duration"));

		(values, duration)
	} else {
		panic!("Expected SetColor payload, received {:?}", value)
	};

	let values = values.iter()
		.map(|(id, color)| {
			let id = parse_id(Some(&String(id.clone())));
			let color = parse_color(Some(color));

			(id, color)
		})
		.collect();

	Some(RequestPayload::SetColor {
		values,
		duration,
	})
}

fn parse_set_power_level_payload(value: Option<&Value>) -> Option<RequestPayload> {
	use Value::Object;
	let payload = if let Some(Object(obj)) = value { obj } else { panic!() };

	let id = parse_id(payload.get("id"));
	let level = coerce_power_level(payload.get("level"));

	Some(RequestPayload::SetPowerLevel { id, level })
}

fn parse_duration(value: Option<&Value>) -> Duration {
	use Value::{Object, Number};
	let obj = match value {
		Some(Object(o)) => o,
		other => panic!("Expected Duration object, received {:?}", other),
	};
	let secs = match obj.get("secs") {
		Some(Number(n)) => n.as_f64().unwrap(),
		other => panic!("Expected Duration.secs integer, received {:?}", other),
	};

	Duration::from_secs_f64(secs)
}

fn parse_id(value: Option<&Value>) -> u64 {
	use Value::String;
	let id = match value {
		Some(String(s)) => s,
		other => panic!("Expected string, received {:?}", other),
	};

	u64::from_str_radix(&id[2..], 16).unwrap()
}

fn parse_color(color: Option<&Value>) -> HSBK {
	let color = match color {
		Some(Value::Object(c)) => c,
		other => panic!("Expected color object, received {:?}", other),
	};

	let hue = coerce_u16(color.get("hue"));
	let saturation = coerce_u16(color.get("saturation"));
	let brightness = coerce_u16(color.get("brightness"));
	let kelvin = coerce_u16(color.get("kelvin"));

	HSBK { hue, saturation, brightness, kelvin }
}

fn coerce_u16(value: Option<&Value>) -> u16 {
	match value {
		Some(Value::Number(v)) => v.as_u64().unwrap() as u16,
		Some(Value::Null) | None => 0,
		other => panic!("Expected u16, null, or undefined, received {:?}", other),
	}
}

fn coerce_power_level(value: Option<&Value>) -> PowerLevel {
	use Value::Number;
	if let Some(Number(v)) = value {
		match v.as_u64().unwrap() {
			0 => PowerLevel::Standby,
			_ => PowerLevel::Enabled,
		}
	} else {
		panic!("Expected PowerLevel, received {:?}", value.unwrap());
	}
}
