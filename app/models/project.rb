class Project < ActiveRecord::Base
	has_many :videos
	def to_s
	  name
	end 
end
