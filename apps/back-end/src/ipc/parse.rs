use anyhow::Result;
use serde_json::Value;

use crate::{
	Error,
	ipc::{Channel, HSBK, Request, RequestPayload},
};

pub fn parse(input: &str) -> Result<Request> {
	let req: Value = serde_json::from_str(input)?;

	let channel = match &req["channel"] {
		Value::String(ch) if ch == "Discovery" => Ok(Channel::Discovery),
		Value::String(ch) if ch == "GetColor"  => Ok(Channel::GetColor),
		Value::String(ch) if ch == "SetColor"  => Ok(Channel::SetColor),
		other => Err(Error(format!("Expected channel, received {:?}", other))),
	}?;

	let p = req.get("payload");
	let payload = match channel {
		Channel::Discovery => parse_discovery_payload(p),
		Channel::GetColor  => parse_get_color_payload(p),
		Channel::SetColor  => parse_set_color_payload(p),
	}?;

	Ok(Request { channel, payload })
}

fn parse_discovery_payload(value: Option<&Value>) -> Result<Option<RequestPayload>> {
	match &value {
		Some(Value::Null) | None => Ok(None),
		_ => Err(Error(
			"Received unexpected payload for Discovery request".to_string()
		).into()),
	}
}

fn parse_get_color_payload(value: Option<&Value>) -> Result<Option<RequestPayload>> {
	use Value::Object;
	let payload = if let Some(Object(obj)) = value { obj } else { unreachable!() };
	let id = parse_id(payload.get("id"))?;

	Ok(Some(RequestPayload::GetColor { id }))
}

fn parse_set_color_payload(value: Option<&Value>) -> Result<Option<RequestPayload>> {
	use Value::{Object, String};
	let payload = if let Some(Object(obj)) = value {
		Ok(obj)
	} else {
		Err(Error(format!("Expected Record<id, color>, received {:?}", value)))
	}?;

	let payload = payload.iter()
		.map(|(id, color)| {
			let id = parse_id(Some(&String(id.clone()))).unwrap();
			let color = parse_color(Some(color)).unwrap();

			(id, color)
		})
		.collect();

	Ok(Some(RequestPayload::SetColor(payload)))
}

fn parse_id(value: Option<&Value>) -> Result<u64> {
	use Value::String;
	let id = if let Some(String(s)) = value {
		Ok(s)
	} else {
		Err(Error(format!("Expected string, received {:?}", value)))
	}?;
	let parsed = u64::from_str_radix(&id[2..], 16)?;

	Ok(parsed)
}

fn parse_color(color: Option<&Value>) -> Result<HSBK> {
	let color = match color {
		Some(Value::Object(c)) => Ok(c),
		other => Err(Error(format!("Expected color object, received {:?}", other))),
	}?;

	let hue = coerce_u16(color.get("hue"))?;
	let saturation = coerce_u16(color.get("saturation"))?;
	let brightness = coerce_u16(color.get("brightness"))?;
	let kelvin = coerce_u16(color.get("kelvin"))?;

	Ok(HSBK { hue, saturation, brightness, kelvin })
}

fn coerce_u16(value: Option<&Value>) -> Result<u16> {
	match value {
		Some(Value::Number(v)) => Ok(v.as_u64().unwrap() as u16),
		Some(Value::Null) | None => Ok(0),
		other => Err(Error(format!(
			"Expected u16, null, or undefined, received {:?}",
			other
		)).into()),
	}
}
