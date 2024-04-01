'use client'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons"
import MovieCard from "../movie/movie-card"

import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';

export default function ImagesSlider(props: any) {
  const responsiveSettings = [
    {
      breakpoint: 800,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 4
      }
    },
    {
      breakpoint: 500,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3
      }
    },
    {
      breakpoint: 300,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2
      }
    }
  ]

  const prevButton = <FontAwesomeIcon icon={faAngleLeft} size="sm" className="cursor-pointer" />
  const nextButton = <FontAwesomeIcon icon={faAngleRight} size="sm" className="cursor-pointer" />

  return (
    <>
      {props.movies &&
        <Slide duration={300} slidesToScroll={1} slidesToShow={1} indicators={true} autoplay={false} responsive={responsiveSettings}>
          {props.movies.map((movie: any, index: number) => (
            <MovieCard key={index} movie={movie} ></MovieCard>
          ))}
        </Slide>
      }
    </>
  )
}